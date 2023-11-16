import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  TextInput,
  Button,
  RadioButton,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Picker} from '@react-native-picker/picker';
import RadioGroup from 'react-native-radio-buttons-group';
import DropDownPicker from 'react-native-dropdown-picker';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const FormScreen = ({navigation, route}) => {

  const currentLocationName = route.params?.currentLocationName || ''; 

  const latitude = route.params?.latitude || ''; 
  const longitude = route.params?.longitude || ''; 
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('female');
// const [city, setCity] = useState();
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const cities = [
    {label: 'Ahmedabad', value: 'Ahmedabad'},
    {label: 'Surat', value: 'Surat'},
    // Add more cities as needed
  ];

  const [uploadimage, setUploadImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    //setIsLoading(false);
    if (route.params && route.params.employee) {
      console.log(route.params.employee);
      const {name, email, mobile, address, gender, selectedCity, imageUrl} =
        route.params.employee;
      setName(name);
      setEmail(email);
      setMobile(mobile);
      setAddress(address);
      setGender(gender);
      setSelectedCity(selectedCity);
      setUrl(imageUrl || '');
    }
    
  }, [route.params]);

  const handleImageUpload = async () => {
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

  const submitForm = () => {
    if (!name || !email || !mobile || !address || !selectedCity) {
      alert('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!validateMobile(mobile)) {
      alert('Please enter a valid mobile number');
      return;
    }
  
    const data = {
      name,
      email,
      mobile,
      address,
      gender,
      selectedCity,
      imageUrl: url,
      currentLocationName: currentLocationName,
      latitude:latitude,
      longitude:longitude
    
    };
    console.log('data', data);

    if (route.params && route.params.employee) {
      const {id} = route.params.employee;
      console.log('Employee ID:', id);

      firestore()
        .collection('employees')
        .doc(id)
        .update(data)
        .then(() => {
          console.log('Employee updated!');
          navigation.navigate('CardData');
          setUrl(''); 
        })
        .catch(error => {
          console.error('Error updating employee: ', error);
        });
    } else {
      firestore()
        .collection('employees')
        .add(data)
        .then(() => {
          console.log('Employee added!');
          navigation.navigate('CardData');
        })
        .catch(error => {
          console.error('Error adding employee: ', error);
        });
    }
  };

  const validateEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validateMobile = mobile => {
    return /^[0-9]{10}$/.test(mobile);
  };
  const radioButtons = useMemo(
    () => [
      {
        id: 1,
        label: 'female',
        value: 'female',
      },
      {
        id: 2,
        label: 'male',
        value: 'male',
      },
    ],
    [],
  );
  const sendData = () => {
    navigation.navigate('CardData');
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <TouchableOpacity onPress={sendData}>
        <Text style={{textAlign: 'right', fontSize: 20, color: 'black'}}>
          List
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.Textinput}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.Textinput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.Textinput}
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.Textinput}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <Text>Gender:</Text>
      <RadioGroup
        radioButtons={radioButtons}
        onPress={setGender}
        selectedId={gender}
      />
      <DropDownPicker
        open={open}
        value={selectedCity}
        items={cities}
        setOpen={setOpen}
        setValue={setSelectedCity}
        style={{marginTop: 20}}
        placeholder="Select a city"
        dropDownContainerStyle={{marginTop: 2}}
      />
      <View style={styles.btn}>
        <Button title="Choose Image" onPress={handleImageUpload} />
      </View>

      {/* <View style={styles.btn}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Submit" onPress={submitForm} />
          )}
        </View> */}
        <View style={styles.buttonContainer}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loaderText}>Uploading Image...</Text>
          </View>
        ) : (
          <Button title="Submit" onPress={submitForm} />
        )}
      </View>
      {/* <TouchableOpacity style={{}} onPress={sendData}>
        <Text style={{textAlign: 'right', fontSize: 20}}>List</Text>
      </TouchableOpacity> */}
      {/* <Image source={{uri:url}} style={{height:200,width:200,}} ></Image> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Textinput: {
    borderWidth: 1,
    height: 50,
    marginTop: 20,
  },
  btn: {
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
export default FormScreen;




import React, { useCallback, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import DocumentPicker from 'react-native-document-picker'
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';


const Chat = () => {
  const [messageList, setMessagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [inputMessage, setInputMessage] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
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
  //       allowMultiSelection: false,
  //       type: [DocumentPicker.types.allFiles],
  //     });

  //     let res = result[0]
  //     console.log('result',result[0], res)

  //     const fileUri = Platform.OS === 'android' ? res.uri : res.uri.replace('file://', '');

  //     console.log('fileUri',fileUri)
  //     uploadFile(fileUri, res.name);
  //   } catch (err) {
  //     console.log('DocumentPicker Error:', err);
  //   }
  // };
  // const pickDocument = () => {

  //   launchImageLibrary(
  //     {
  //       mediaType: 'photo',
  //     },
  //     response => {
  //       console.log('response', response)
  //       if (response.didCancel) {
  //         console.log('User cancelled image picker');
  //       } else if (response.error) {
  //         console.log('ImagePicker Error: ', response.error);
  //       } else if (response.assets && response.assets.length > 0) {
  //         const { uri, type } = response.assets[0];
  //         console.log('uri', uri);
  //         setSelectedImage(uri, type);
  //       }
  //     }
  //   );
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

  // const onSendMessage = async () => {
  //   if (inputMessage.trim() === '') {
  //     return;
  //   }
  //   let imageUrl = null;
  //   if (selectedImage) {
  //     imageUrl = await uploadImage(selectedImage);
  //   }

  //   const msg = {
  //     text: inputMessage,
  //     image: imageUrl,
  //     sendBy: route.params.id,
  //     sendTo: route.params.data.userId,
  //     createdAt: new Date().toISOString(),
  //   };

  //   // Add the message to Firestore
  //   firestore()
  //     .collection('chats')
  //     .doc(`${route.params.id}${route.params.data.userId}`)
  //     .collection('messages')
  //     .add(msg);

  //   firestore()
  //     .collection('chats')
  //     .doc(`${route.params.data.userId}${route.params.id}`)
  //     .collection('messages')
  //     .add(msg);

  //   // Update local state to display the sent message
  //   setMessagesList(prevMessages => [...prevMessages, msg]);
  //   setInputMessage('');
  //   setSelectedImage(null);
  // };

  const onSendMessage = async () => {
    if (inputMessage.trim() === '') {
      return;
    }
    
    if (selectedImage) {
      imageUrl = await uploadFile(selectedImage.uri, `image_${Date.now()}`, selectedImage.type);
      console.log('imageUrl::::::',imageUrl)
      setSelectedImage(null);
    }
  
    const msg = {
      text: inputMessage,
      image: imageUrl,
      sendBy: route.params.id,
      sendTo: route.params.data.userId,
      createdAt: new Date().toISOString(),
    };
  
    // Add the message to Firestoreg
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
  
    // Update local state to display the sent message
    setMessagesList(prevMessages => [...prevMessages, msg]);
    setInputMessage('');
  };
  
  const renderTime = createdAt => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const uploadFile = async (uri, fileName) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = storage().ref().child(`files/${fileName}`);
      const uploadTask = storageRef.put(blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Track the upload progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('File Upload Error:', JSON.stringify(error));
        },
        async () => {
          // Upload complete, get the file URL
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

          // Add the file message to Firestore
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

          // Update local state to display the sent message

          setMessagesList(prevMessages => [...prevMessages, msg]);
        }
      );
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
                {item.text && <Text>{item.text}</Text>}
                {item.file && (



                  <TouchableOpacity onPress={() => console.log('Open file:', item.file.url)}>
                    <Text>{item.file.name}</Text>
                  </TouchableOpacity>
                )}
                {item.image && <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />}
                <Text>{renderTime(item.createdAt)}</Text>
              </View>
            );
          }}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickDocument}>
            <Text style={{ color: 'white', marginLeft: 10 }}>File</Text>
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
