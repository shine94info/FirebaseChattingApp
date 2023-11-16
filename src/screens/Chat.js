import React, { useCallback, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity, Image } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import DocumentPicker from 'react-native-document-picker'
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Loader from '../components/Loader';


const Chat = () => {
  const [messageList, setMessagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');


  const [inputMessage, setInputMessage] = useState();
  const [selectedImage, setUploadImage] = useState(null);
  //chat ko navigation se nikalne ke liye.
  const route = useRoute();

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

  //The messages parameter is an array, and the first message in the array (messages[0]) is retrieved. This assumes that only one message is being sent at a time.
  // const onSend = useCallback(async (messages = []) => {
  //   console.log('route.param', route.params)
  //   console.log('route.params.id', route.params.id)
  //   console.log('route.params.data.userId', route.params.data.userId)
  //   const msg = messages[0];
  //   console.log()
  //   const myMsg = {

  //     ...msg,
  //     sendBy: route.params.id,
  //     sendTo: route.params.data.userId,
  //     createdAt: Date.parse(msg.createdAt),
  //   };

  //   setMessagesList(previousMessages => GiftedChat.append(previousMessages, myMsg));

  //   firestore()
  //     .collection('chats')
  //     .doc(`${route.params.id}${route.params.data.userId}`)
  //     .collection('messages')
  //     .add(myMsg);
  //   firestore()
  //     .collection('chats')
  //     .doc(`${route.params.data.userId}${route.params.id}`)
  //     .collection('messages')
  //     .add(myMsg);
  // }, []);


  // const pickDocument = async () => {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.allFiles],
  //     });

  //     const fileUri = Platform.OS === 'android' ? result.uri : result.uri.replace('file://', '');
  //     uploadFile(fileUri, result.name);
  //   } catch (err) {
  //     console.log('DocumentPicker Error:', err);
  //   }
  // };

  const pickDocument = async () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchImageLibrary(options, response => {
      setIsLoading(true);
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        setIsLoading(false);
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        setIsLoading(false);
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

        task
          .then(async () => {
            console.log('Image uploaded to the bucket!');
            setIsLoading(false);

            // Get the image URL
            try {
              const downloadURL = await storage()
                .ref(`images/${filename}`)
                .getDownloadURL();
              console.log('Image URL:', downloadURL);
              setUploadImage(downloadURL);
              setUrl(downloadURL);
            } catch (error) {
              console.error('Error getting download URL: ', error);
            }
          })
          .catch(error => {
            console.error('Error uploading image to storage: ', error);
          });
      }
    });
  };
  const onSendMessage = async () => {
    if (inputMessage.trim() === '' && !selectedImage) {
      // No message or image to send
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
      createdAtNano: new Date().valueOf() * 1000000,
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
    setUploadImage(null);
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
      {/* <GiftedChat
        messages={messageList}
        onSend={messages => onSend(messages)}
        user={{
          _id: route.params.id,
        }}
        
      /> */}
      <View style={styles.container}>
        <View></View>
        <FlatList
          data={messageList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            return (
              <View style={[styles.messageContainer, item.sendBy === route.params.data.userId ? styles.receivedMessage : styles.sentMessage]}>
                {item.text && <Text>{item.text}</Text>}
                {item.file && (
                  <TouchableOpacity onPress={() => console.log('Open file:', item.file.url)}>
                    <Text>{item.file.name}</Text>
                  </TouchableOpacity>
                )}
                {item.image && (
                  <TouchableOpacity onPress={() => setUploadImage(item.image)}>

    {isLoading ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />
                )}
                </TouchableOpacity>
)}

                {/* {item.image && <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />} */}
                {item.file?.url && <Image source={{ uri: item.file?.url }} style={{ width: 200, height: 200 }} />}
                <Text>{renderTime(item.createdAt)}</Text>
              </View>
              
            );
          }}
        />
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
          <TouchableOpacity onPress={onSendMessage}>
            <Text>Send</Text>
          </TouchableOpacity>
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
  messageContainer: {
    padding: 10,
    borderWidth: 1,
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
  }
});
export default Chat;
