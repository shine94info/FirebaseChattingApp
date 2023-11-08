//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {Component, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
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
        setVisible(false);

        if (res.docs!== 0) {
          goToNext(
            res.docs[0].data().name,
            res.docs[0].data().email,
            res.docs[0].data().userId,
          );
        }
        else{
          Alert.alert('user not found');
        }
      })
      .catch(error => {
        setVisible(false);
        console.log(error);
        Alert.alert('user not found');

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
