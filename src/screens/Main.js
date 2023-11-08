import React, {useState} from 'react';
import {View, Text, StyleSheet, Image,TouchableOpacity} from 'react-native';
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
