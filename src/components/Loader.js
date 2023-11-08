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
