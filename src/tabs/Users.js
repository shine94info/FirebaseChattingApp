import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
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
// let id = '';

const Users = () => {
  const [users, setusers] = useState([]);

  const navigation = useNavigation();
  useEffect(() => {
    getUsers();
  }, []);
  // const getUsers = async () => {
  //   //empty array
  //   id=await AsyncStorage.getItem('USERID');
  //   console.log('id of user',id)
  //   let tempData = [];
  //   const email = await AsyncStorage.getItem('EMAIL');
  //   firestore()
  //     .collection('users')
  //     .where('email', '!=', email)
  //     .get()
  //     .then(res => {
  //       if (res.docs != []) {
  //         res.docs.map(item => {
  //           tempData.push(item.data());
  //         });
  //       }
  //       setusers(tempData);
  //       //     console.log(JSON.stringify(res.docs[0].data()));
  //     });
  // };
  const getUsers = async () => {
    id = await AsyncStorage.getItem('USERID');
    let tempData = [];
    const email = await AsyncStorage.getItem('EMAIL');
    firestore()
      .collection('users')
      .where('email', '!=', email)
      .get()
      .then((res) => {
        if (res.docs.length > 0) {
          res.docs.forEach((item) => {
            if (item.data().userId !== id) { // Exclude the current user
              tempData.push(item.data());
            }
          });
        }
        setusers(tempData);
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
