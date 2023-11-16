import React from 'react';
import { Modal, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const FullScreenImage = ({ imageUrl, onClose }) => {
  return (
    <Modal transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.fullScreenImage} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  fullScreenImage: {
    flex: 1,
    resizeMode: 'contain',
  },
});

export default FullScreenImage;
