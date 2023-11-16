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
