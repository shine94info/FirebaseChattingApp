import {useRoute} from '@react-navigation/native';
import React, {Component, useCallback, useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
const Chat = () => {
  const [messages, setMessagesList] = useState([]);
  //chat ko navigation se nikalne ke liye.
  const route = useRoute();
  useEffect(() => {
//for receive msg.getting msg in real time

    const subscriber = firestore()
    .collection('chats')
    .doc(route.params.id + route.params.data.userId)
    .collection('messages')
    .orderBy("createdAt",'desc');
    subscriber.onSnapshot(querysnapshot =>
        {
            const allmessages = querysnapshot.docs.map(item =>
                {
                    return {...item._data,createdAt:item.data.createdAt};
                });
            setMessagesList(allmessages);
        });
        return () =>
        subscriber();
    
  }, []);

  const onSend = useCallback(async(messages = [] ) => {
    const msg = messages[0];
    const myMsg = {
      ...msg,
      sendBy: route.params.id,
      sendTo: route.params.data.userId,
      createdAt: Date.parse(msg.createdAt),
    };

    setMessagesList(previousMessages => GiftedChat.append(previousMessages, myMsg));

    firestore()
      .collection("chats")
      .doc("" + route.params.id + route.params.data.userId)
      .collection('messages')
      .add(myMsg);
    firestore()
      .collection('chats')
      .doc("" + route.params.data.userId + route.params.id)
      .collection('messages')
      .add(myMsg);
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: route.params.id,
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default Chat;
//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {Component, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/Loader';
const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const loginUser = () => {
    setVisible(true);
    firestore()
      .collection('users')
      .where('email', '==', email)
      .get()
      .then(res => {
        if (res.docs !== []) {
          console.log(JSON.stringify(res.docs[0].data()));
          goToNext(
            res.docs[0].data().name,
            res.docs[0].data().email,
            res.docs[0].data().userId,
          );
        }
      })
      .catch(error => {
        setVisible(false);
        console.log(error);
      });
  };
  const goToNext = async (name, email, userId) => {
    await AsyncStorage.setItem('NAME', name);
    await AsyncStorage.setItem('PASSWORD', email);
    await AsyncStorage.setItem('USERID', userId);
    navigation.navigate('Main');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={txt => setEmail(txt)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={txt => setPassword(txt)}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          loginUser();
        }}>
        <Text style={styles.btntext}>Login</Text>
      </TouchableOpacity>
      <Text
        style={styles.orLogin}
        onPress={() => navigation.navigate('Signup')}>
        Or Sign Up
      </Text>
      <Loader visible={visible} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#744a6b',
  },
  title: {
    fontSize: 30,
    color: '#0a0a0a',
    marginTop: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  input: {
    height: 60,
    width: '90%',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 30,
    marginTop: 30,
    alignSelf: 'center',
    paddingLeft: 10,
  },
  btn: {
    height: 60,
    width: '90%',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 30,
    marginTop: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  btntext: {
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
    fontWeight: '600',
  },
  orLogin: {
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 30,
    textDecorationLine: 'underline',
    color: 'black',
    fontWeight: '600',
  },
});

export default Login;
import React, {useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Users from '../tabs/Users';
import Setting from '../tabs/Setting';

const Main = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <View style={styles.container}>
      {selectedTab == 0 ? <Users /> : <Setting />}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab(0)}>
          <Image
            source={require('../Images/group.png')}
            style={[
              styles.tabIcon,
              {tintColor: selectedTab == 0 ?'#0f12a5' : 'white'},
            ]}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab(1)}>
          <Image
            source={require('../Images/settings.png')}
            style={[
              styles.tabIcon,
              {tintColor: selectedTab == 1 ?  '#0f12a5' : 'white'},
            ]}></Image>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#882088',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  tab: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 40,
    height: 35,
  },
});

export default Main;
//import liraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
const Signup = () => {
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const registerUser = () => {
        const userId = uuid.v4()
        firestore().collection("users").doc(userId).set({
            name: name,
            email: email,
            password: password,
            mobile: mobile, 
            userId: userId
        }).then(res => {

            console.log('user generated.');
            navigation.goBack;
        }).catch(error => {
            console.log(error);
        })

    };
    const validate=()=>{
    let isValid= true;
    
        if(name=='')
        {
            isValid = false;
        }
        if(email=='')
        {
            isValid = false;
        }
        if(mobile=='')
        {
            isValid = false;
        } if(password=='')
        {
            isValid = false;
        } if(confirmPassword=='')
        {
            isValid = false;
        } if(confirmPassword !== password)
        {
            isValid = false;
        }
        return isValid;

    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={[styles.input, { marginTop: 50 }]}
                placeholder='Enter Name'
                value={name}
                onChangeText={txt => setName(txt)}
            />
            <TextInput style={styles.input}
                placeholder='Enter Email'
                value={email}
                onChangeText={txt => setEmail(txt)}
            />
            <TextInput style={styles.input}
                placeholder='Enter Mobile'
                keyboardType={'number-pad'}
                value={mobile}
                onChangeText={txt => setMobile(txt)}
            />
            <TextInput style={styles.input}
                placeholder='Enter Password'
                value={password}
                onChangeText={txt => setPassword(txt)}
            />
            <TextInput style={styles.input}
                placeholder='Enter ConfirmPassword'
                value={confirmPassword}
                onChangeText={txt => setConfirmPassword(txt)}
            />
            <TouchableOpacity style={styles.btn} onPress={() => {
                if(validate())
                {
                    registerUser();

                }
                else{
                    Alert.alert('please enter correct data');
                }
            }}>
                <Text style={styles.btntext}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.orLogin} onPress={() => {
                navigation.navigate('Login');
            }}>Or Login</Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#744a6b',
    },
    title:
    {
        fontSize: 30,
        color: '#0a0a0a',
        marginTop: 20,
        alignSelf: 'center',
        marginTop: 20
    },
    input:
    {
        height: 60,
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        marginHorizontal: 30,
        marginTop: 30,
        alignSelf: 'center',
        paddingLeft: 10
    },
    btn:
    {
        height: 60,
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        marginHorizontal: 30,
        marginTop: 30,
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center'
    },
    btntext:
    {
        textAlign: 'center',
        fontSize: 20,
        color: 'black',
        fontWeight: '600'
    },
    orLogin:
    {
        fontSize: 16,
        alignSelf: 'center',
        marginTop: 30,
        textDecorationLine: 'underline',
        color: 'black',
        fontWeight: '600'
    }
});

export default Signup;
//import liraries
import React, {Component} from 'react';
import {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// create a component
const SplashScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      checkingLogin();
    }, 2000);
  }, []);
  const checkingLogin = async () => {
    const id = await AsyncStorage.getItem('USERID');

    if (id !== null) {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Login');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>{'Firebase Chat \n App'}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#81256d',
  },
  logo: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
  },
});

export default SplashScreen;
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import SplashScreen from '../screens/Splash';
import Signup from '../screens/Signup';
import Login from '../screens/Login';
import Main from '../screens/Main';
import Chat from '../screens/Chat';
const Stack = createStackNavigator();
// create a component
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={'Splash'}
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={'Signup'}
          component={Signup}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={'Login'}
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={'Main'}
          component={Main}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={'Chat'}
          component={Chat}
          options={{headerShown: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
let id = '';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
const Users = () => {
  const [users, setusers] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    getUsers();
  }, []);
  const getUsers = async () => {
    //empty array
    id=await AsyncStorage.getItem('USERID');
    let tempData = [];
    const email = await AsyncStorage.getItem('EMAIL');
    firestore()
      .collection('users')
      .where('email', '!=', email)
      .get()
      .then(res => {
        if (res.docs != []) {
          res.docs.map(item => {
            tempData.push(item.data());
          });
        }
        setusers(tempData);
        //     console.log(JSON.stringify(res.docs[0].data()));
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.Header}>
        <Text style={styles.title}>RN FIREBASE CHAT APP</Text>
      </View>
      <FlatList
        data={users}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                navigation.navigate('Chat', {data: item,id:id});
              }}>
              <Image
                style={styles.userIcon}
                source={require('../Images/profile.png')}></Image>
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',

    backgroundColor: '#8d538d',
  },
  Header: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#812f81',
    fontSize: 20,
  },
  userItem: {
    width: Dimensions.get('window').width - 50,
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'row',
    borderWidth: 0.5,
    height: 60,
    borderRadius: 10,
    paddingLeft: 20,
    alignItems: 'center',
  },
  userIcon: {
    height: 40,
    width: 40,
  },
  userName: {
    marginLeft: 20,
    color: 'black',
    fontSize: 18,
  },
});

export default Users;
import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, ActivityIndicator } from 'react-native';

const Loader = ({visible}) => {
    return (

        <Modal visible={visible} transparent>
            <View style={styles.modelView}>
                <View style={styles.mainView}>
                    <ActivityIndicator size={'large'}></ActivityIndicator>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modelView: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainView: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignContent: 'center'

    },
});

export default Loader;






import React, { useCallback, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';


const Chat = () => {
  const [messageList, setMessagesList] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const route = useRoute();

  useEffect(() => {
    const subscriber = firestore()
      .collection('chats')
      .doc(route.params.id + route.params.data.userId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(querySnapshot => {
        const allMessages = querySnapshot.docs.map(item => {
          return { ...item.data(), id: item.id };
        });
        setMessagesList(allMessages);
      });

    return () => subscriber();
  }, []);

  const onSendMessage = async () => {
    if (inputMessage.trim() === '') {
      return; // Don't send empty messages
    }

    const msg = {
      text: inputMessage,
      sendBy: route.params.id,
      sendTo: route.params.data.userId,
      createdAt: new Date().toISOString(),
    };

    // Add the message to Firestore
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
    setInputMessage('');
  };

  const renderTime = createdAt => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const fileUri = Platform.OS === 'android' ? result.uri : result.uri.replace('file://', '');
      uploadFile(fileUri, result.name);
    } catch (err) {
      console.log('DocumentPicker Error:', err);
    }
  };

  const uploadFile = async (uri, fileName) => {
    const response = await fetch(uri);
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

    setMessagesList(prevMessages => [...prevMessages, msg]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messageList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          console.log('item:::::', item);
          return (
            <View style={[styles.messageContainer, item.sendBy === route.params.data.userId ? styles.receivedMessage : styles.sentMessage]}>
`              {item.text && <Text>{item.text}</Text>}
`              {item.file && (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'grey',
  },
  messageContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    maxWidth: '80%',
    borderRadius: 10,
    backgroundColor: 'pink',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'pink',
    borderRadius: 30,
  },
  input: {
    width: '70%',
  },
});

export default Chat;
