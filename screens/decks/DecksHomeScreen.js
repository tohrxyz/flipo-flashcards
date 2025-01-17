import { TouchableOpacity, useColorScheme, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Example decks
import exampleDecksData from '../../default_data/example-decks';

// Color schemes
import colorSchemes from '../../assets/colorSchemes';

// Components
import FlipoText from '../../components/FlipoText';
import DeckCard from '../../components/decks/DeckCard';
import { ScrollView } from 'react-native-gesture-handler';

// Functions
import { useCallback, useEffect, useState } from 'react';

const DecksHomeScreen = () => {
  const navigation = useNavigation();
  let colorScheme = colorSchemes[useColorScheme()];

  // header title setup
  navigation.setOptions({
    headerStyle: {
      backgroundColor: colorScheme['main'],
      borderBottomWidth: 3,
      borderBottomColor: colorScheme['ui'],
      height: 100,
    },
  });

  // Custom deck states
  const [customDecks, setCustomDecks] = useState([]);
  const [customDeckElements, setCustomDeckElements] = useState([]);

  // Example deck states
  const [exampleDecks, setExampleDecks] = useState([]);
  const [exampleDeckElements, setExampleDeckElements] = useState([]);

  // loads custom deck data
  const getCustomDecks = async () => {
    try {
      let data = await AsyncStorage.getItem('customDecks');
      data = JSON.parse(data);

      // checks if the custom decks have updated, if they have, sets new state
      // has to convert object to string so it works if the objects are the same
      if (data != null && JSON.stringify(data.decks) != JSON.stringify(customDecks)) {
        console.log('Found new custom deck changes.')
        setCustomDecks(data.decks);
      } else if (data == null && JSON.stringify(customDecks) != '[]') {
        setCustomDecks([]);
      }

    } catch (e) {
      console.error('There was an error with loading the decks.')
    }
  }

  // loads example deck data
  const getExampleDecks = async () => {
    try {
      let data = await AsyncStorage.getItem('exampleDecks');
      data = JSON.parse(data);

      // checks if the example decks have updated, if they have, sets new state
      // has to convert object to string so it works if the objects are the same
      if (data != null && JSON.stringify(data.decks) != JSON.stringify(exampleDecks)) {
        console.log('Found new example deck changes.')
        setExampleDecks(data.decks);

      } else if (data == null) {
        console.log('No example deck data was found. Loading predefined defaults.')
        setExampleDecks(exampleDecksData);
        storeExampleDecks({'decks': exampleDecksData});
      }

    } catch (e) {
      console.error('There was an error with loading the decks.')
    }
  }

  // stores example deck data
  const storeExampleDecks = async (data) => {
    try {
      await AsyncStorage.setItem('exampleDecks', JSON.stringify(data));
    } catch (e) {
      console.error('There was an error with saving the decks.')
    }
  };

  // Updates the deck data states if local data has changed outside this screen
  useFocusEffect(
    useCallback(() => {
      console.log('DecksHomeScreen: Updating deck data.');
      getCustomDecks();
      getExampleDecks();
    }, [])
  );

  // Updates the deck elements on data change
  useEffect(() => {
    console.log('DecksHomeScreen: Updating deck elements.')
    updateCustomDeckElements();
    updateExampleDeckElements();
  }, [customDecks, exampleDecks]);

  const updateCustomDeckElements = () => {
    console.log('DeckHomeScreen: Refreshed custom decks.');
    setCustomDeckElements(customDecks.map(deck => (
      <TouchableOpacity 
        key={deck.id}
        onPress={() => navigation.navigate('DeckProfileScreen', {
          updateDecks: getCustomDecks,
          deck: deck,
        })}
      >
        <DeckCard
        labelUnder
        title={deck.title}
        className='w-52'
        coverUrl={deck.coverUrl}
        />
      </TouchableOpacity>
    )));
  }

  const updateExampleDeckElements = () => {
    console.log('DeckHomeScreen: Refreshed example decks.');
    setExampleDeckElements(exampleDecks.map(deck => (
      <TouchableOpacity
        key={deck['id']}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('DeckProfileScreen', {
          updateDecks: getExampleDecks,
          deck: deck,
        })}
        >
          <DeckCard 
            labelUnder
            title={deck['title']}
            coverUrl={deck['coverUrl']}
            className='w-52'/>
      </TouchableOpacity>
    )));
  }
  

  return (
    <View className='bg-primary dark:bg-primary-dark min-h-screen'>
      <ScrollView
        className='space-y-8 -mt-9 pt-16 h-screen'
        showsVerticalScrollIndicator={false}
        overScrollMode='never'
      >
        {/* User decks */}
        <View className='flex flex-col space-y-6'>
          <View className='px-8'>
            <FlipoText
              weight='extra-bold'
              className='text-4xl text-secondary dark:text-secondary-dark'
            >
              Your decks 
            </FlipoText>
            <FlipoText 
              weight='semi-bold'
              className={`text-base text-ui dark:text-strong-dark`}>
                Play your created decks
            </FlipoText>
          </View>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            overScrollMode='never'
            className='w-screen'
          >
            <View className='flex flex-row space-x-10 px-14'>
            {/*New deck card (always apears at the end)*/}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DeckEditScreen', {
                updateDeckProfile: getCustomDecks,
                updateDecks: getCustomDecks,
              })}
            >
                <DeckCard 
                  labelUnder title='Create new deck'
                  className='w-52'
                  coverUrl={require('../../assets/decks/new-deck.png')}
                />
            </TouchableOpacity>
            {/* Custom Decks */}
            {customDeckElements}
            </View>
          </ScrollView>
        </View>
        
        {/* Example decks */}
        <View className='flex flex-col space-y-6 pb-60'>
          <View className='px-8'>
            <FlipoText
              weight='extra-bold'
              className='text-4xl text-secondary dark:text-secondary-dark'
            >
              Example decks
            </FlipoText>
            <FlipoText 
              weight='semi-bold'
              className='text-base text-ui dark:text-strong-dark'
            >
              Play pre-created decks
            </FlipoText>
          </View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            overScrollMode='never'
            className='w-screen'
          >
            <View className='flex flex-row space-x-10 px-14'>
              {exampleDeckElements}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export default DecksHomeScreen;