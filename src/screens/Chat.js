import React, { useCallback, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Chat = () => {

  const [messageList, setMessagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [inputMessage, setInputMessage] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);


  //chat ko navigation se nikalne ke liye.
  const route = useRoute();

  const openImageModal = (image) => {
    setSelectedImage(image);
    setImageModalVisible(true);
  };

  const CloseImageModel = () => {
    setSelectedImage(null);
    setImageModalVisible(false);
  }

  //for receive msg getting msg in real time
  useEffect(() => {
    const subscriber = firestore()
      .collection('chats')
      .doc(route.params.id + route.params.data.userId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(querySnapshot => {
        const allMessages = querySnapshot.docs.map(item => {
          // return { ...item.data, createdAt: item._data.createdAt };
          return { ...item.data(), id: item.id };
        });
        setMessagesList(allMessages);
      });

    // Return the unsubscribe function directly
    return () => subscriber(); // Change this line to return () => subscriber;
  }, []);

  const pickDocument = async () => {

    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {

      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {

        const uri = response.assets[0].uri;
        console.log('uri????', uri);
        const filename = uri.substring(uri.lastIndexOf('/'));
        console.log('filename', filename);

        // Upload the image to Firebase storage
        const reference = storage().ref(`images/${filename}`);
        const task = reference.putFile(uri);

        task.on('state_changed', taskSnapshot => {
          if (taskSnapshot.bytesTransferred === taskSnapshot.totalBytes) {
            setIsLoading(false);
          }
        });
        setIsLoading(true);

        task
          .then(async () => {
            console.log('Image uploaded to the bucket!');

            // Get the image URL
            try {
              const downloadURL = await storage()
                .ref(`images/${filename}`)
                .getDownloadURL();
              console.log('Image URL:', downloadURL);
              setSelectedImage(downloadURL);
              setUrl(downloadURL);

              // Move the code below to update the state outside the try block
              const msg = {
                text: inputMessage || '',
                image: downloadURL,
                sendBy: route.params.id,
                sendTo: route.params.data.userId,
                createdAt: new Date().toISOString(),
                Type: downloadURL ? 'image' : 'text'
              };

              // Add the message to Firestore
              firestore()
                .collection('chats')
                .doc(`${route.params.id}${route.params.data.userId}`)
                .collection('messages')
                .add(msg);

              firestore()
                .collection('chats')
                .doc(`${route.params.data.userId}${route.params.id}`)
                .collection('messages')
                .add(msg);

              // Update local state to display the sent message
              setMessagesList((prevMessages) => [...prevMessages, msg]);
              setInputMessage('');
              setSelectedImage(null);
            } catch (error) {
              console.error('Error getting download URL: ', error);
            }
          })
          .catch(error => {
            console.error('Error uploading image to storage: ', error);
          })
      }
    });
  };
  const onSendMessage = async () => {

    if ((!inputMessage.trim() && !selectedImage)) {
      return;
    }
    let imageUrl = null;

    // Check if an image is selected
    if (selectedImage) {
      // Generate a unique filename for the image
      const filename = `image_${new Date().getTime()}.jpg`;

      // Upload the image and get the URL
      imageUrl = await uploadFile(selectedImage, filename);
    }

    const msg = {
      text: inputMessage || '', // Use an empty string if inputMessage is undefined
      image: imageUrl,
      sendBy: route.params.id,
      sendTo: route.params.data.userId,
      createdAt: new Date().toISOString(),
      type: imageUrl ? 'image' : 'text',
    };

    // Add the message to Firestore
    firestore()
      .collection('chats')
      .doc(`${route.params.id}${route.params.data.userId}`)
      .collection('messages')
      .add(msg);

    firestore()
      .collection('chats')
      .doc(`${route.params.data.userId}${route.params.id}`)
      .collection('messages')
      .add(msg);

    // Update local state to display the sent message
    setMessagesList((prevMessages) => [...prevMessages, msg]);
    setInputMessage('');
    setSelectedImage(null);
  };

  const renderTime = createdAt => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const uploadFile = async (uri, fileName) => {
    try {
      // const response = await fetch(uri);
      const response = await fetch(uri, { timeout: 60000 });
      const blob = await response.blob();

      const storageRef = storage().ref().child(`files/${fileName}`);
      await storageRef.put(blob);

      const fileUrl = await storageRef.getDownloadURL();

      const msg = {
        file: {
          name: fileName,
          url: fileUrl,
        },
        sendBy: route.params.id,
        sendTo: route.params.data.userId,
        createdAt: new Date().toISOString(),
        type: 'image',
      };

      await firestore()
        .collection('chats')
        .doc(`${route.params.id}${route.params.data.userId}`)
        .collection('messages')
        .add(msg);

      await firestore()
        .collection('chats')
        .doc(`${route.params.data.userId}${route.params.id}`)
        .collection('messages')
        .add(msg);

      setMessagesList(prevMessages => [...prevMessages, msg]);
    } catch (error) {
      console.error('File Upload Error:', error);
    }

  };
  return (
    <View style={styles.container}>
      <View style={styles.container}>

        <FlatList
          data={messageList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            return (
              <View style={[styles.messageContainer, item.sendBy === route.params.data.userId ? styles.receivedMessage : styles.sentMessage]}>
                {item.text && <View style={{ flexDirection: 'row' }}>
                  <Text>{item.text}</Text>
                  <Text style={{ marginTop: 6, fontSize: 12 }}>{renderTime(item.createdAt)}</Text>
                </View>
                }
                {item.image && <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => openImageModal(item.image)}>
                    <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />

                    <Text style={{ marginTop: 6, fontSize: 12, alignSelf: 'flex-end' }}>{renderTime(item.createdAt)}</Text>
                  </TouchableOpacity>
                </View>
                }
              </View>

            );
          }}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isImageModalVisible}
          onRequestClose={CloseImageModel}>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage }} style={{ height: '100%', width: '100%' }} resizeMode="contain" >

            </Image>
            <TouchableOpacity onPress={CloseImageModel} style={styles.closeButton}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>

          </View>
        </Modal>


        <View style={styles.inputContainer}>
          {isLoading ? (
            <View style={styles.messageContainer}>
              <Text style={{ textAlign: 'center' }}>Uploading Image...</Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={pickDocument}>
                <Text>File</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                multiline={true}
                placeholder="Type a message..."
                value={inputMessage}
                onChangeText={text => setInputMessage(text)}
              />
              <TouchableOpacity onPress={onSendMessage} disabled={(!inputMessage && !selectedImage)}>
                <Text>Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'grey'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    padding: 10,
    borderColor: '#ccc',
    marginBottom: 10,
    maxWidth: '80%',
    borderRadius: 10,
    backgroundColor: 'pink'
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  inputContainer:
  {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
    borderRadius: 30
  },
  input:
  {
    width: '85%'
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
export default Chat;
