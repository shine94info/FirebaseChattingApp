import React, { useCallback, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';

const Chat = () => {
  const [messageList, setMessagesList] = useState([]);
  //chat ko navigation se nikalne ke liye.
  const route = useRoute();

    //for receive msg getting msg in real time
  useEffect(() => {
    const subscriber = firestore()
      .collection('chats')
      .doc(route.params.id + route.params.data.userId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const allMessages = querySnapshot.docs.map(item => {
          return { ...item.data, createdAt: item._data.createdAt};
        });
        setMessagesList(allMessages);
      });
  
    // Return the unsubscribe function directly
    return () => subscriber(); // Change this line to return () => subscriber;
  }, []);
  
//The messages parameter is an array, and the first message in the array (messages[0]) is retrieved. This assumes that only one message is being sent at a time.
  const onSend = useCallback(async (messages = []) => {
    console.log('route.param',route.params)
    console.log('route.params.id',route.params.id)
    console.log('route.params.data.userId', route.params.data.userId)
    const msg = messages[0];
    console.log()
    const myMsg = {
    
      ...msg,
      sendBy: route.params.id,
      sendTo: route.params.data.userId,
      createdAt: Date.parse(msg.createdAt),
    };

    setMessagesList(previousMessages => GiftedChat.append(previousMessages, myMsg));

    firestore()
      .collection('chats')
      .doc(`${route.params.id}${route.params.data.userId}`)
      .collection('messages')
      .add(myMsg);
    firestore()
      .collection('chats')
      .doc(`${route.params.data.userId}${route.params.id}`)
      .collection('messages')
      .add(myMsg);
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messageList}
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
