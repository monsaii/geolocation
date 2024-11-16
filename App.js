import React from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Image,
  TouchableHighlight,
  BackHandler,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import MessageList from './components/MessageList';
import Toolbar from './components/Toolbar';
import {
  createImageMessage,
  createLocationMessage,
  createTextMessage,
} from './components/MessageUtils';

export default class App extends React.Component {
  state = {
    messages: [
      createLocationMessage({ latitude: 14.619283, longitude: 121.057715 }),
      createTextMessage('Hello'),
      createTextMessage('World'),
      createImageMessage('https://unsplash.it/300/300'),
    ],
    fullscreenImageId: null,
    isInputFocused: false,
  };

  componentDidMount() {
    this.subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  handleBackPress = () => {
    const { fullscreenImageId } = this.state;
    if (fullscreenImageId) {
      this.dismissFullscreenImage();
      return true;
    }
    return false;
  };

  handlePressMessage = ({ id, type, content }) => {
    if (type === 'text') {
      Alert.alert(
        'Delete Message',
        'Do you want to delete this message?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => this.deleteMessage(id),
            style: 'destructive',
          },
        ]
      );
    } else if (type === 'image') {
      Keyboard.dismiss();
      this.setState({
        fullscreenImageId: id,
        isInputFocused: false,
      });
    } else if (type === 'location') {
      if (!content || !content.latitude || !content.longitude) {
        Alert.alert('Error', 'Location data is missing or invalid.');
        return;
      }

      Alert.alert(
        'Pinned Location',
        `Latitude: ${content.latitude}\nLongitude: ${content.longitude}`,
        [{ text: 'OK' }]
      );
    }
  };

  deleteMessage = (id) => {
    this.setState((prevState) => ({
      messages: prevState.messages.filter((message) => message.id !== id),
    }));
  };

  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null });
  };

  renderFullscreenImage = () => {
    const { messages, fullscreenImageId } = this.state;
    if (!fullscreenImageId) return null;

    const image = messages.find((message) => message.id === fullscreenImageId);
    if (!image) return null;

    const { uri } = image;
    return (
      <TouchableHighlight
        style={styles.fullscreenOverlay}
        onPress={this.dismissFullscreenImage}
      >
        <Image style={styles.fullscreenImage} source={{ uri }} />
      </TouchableHighlight>
    );
  };

  renderMessageList = () => {
    const { messages } = this.state;
    return (
      <View style={styles.messageList}>
        <MessageList
          messages={messages}
          onPressMessage={this.handlePressMessage}
        />
      </View>
    );
  };

  handleChangeFocus = (isFocused) => {
    this.setState({ isInputFocused: isFocused });
  };

  handleSubmit = (text) => {
    const { messages } = this.state;
    this.setState({
      messages: [createTextMessage(text), ...messages],
    });
  };

  handlePressToolbarCamera = () => {
    const { messages } = this.state;
    const newImageMessage = createImageMessage('https://unsplash.it/400/400');
    this.setState({ messages: [newImageMessage, ...messages] });
  };

  handlePressToolbarLocation = () => {
    const { messages } = this.state;
    const newLocationMessage = createLocationMessage({
      latitude: 14.619283,
      longitude: 121.057715,
    });
    this.setState({ messages: [newLocationMessage, ...messages] });
  };

  render() {
    const { isInputFocused } = this.state;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {this.renderMessageList()}
          {this.renderFullscreenImage()}
          <View style={styles.toolbar}>
            <Toolbar
              isFocused={isInputFocused}
              onChangeFocus={this.handleChangeFocus}
              onSubmit={this.handleSubmit}
              onPressCamera={this.handlePressToolbarCamera}
              onPressLocation={this.handlePressToolbarLocation}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  toolbar: {
    backgroundColor: 'white',
    borderTopColor: 'rgba(0,0,0,0.04)',
    borderTopWidth: 1,
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
