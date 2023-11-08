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
