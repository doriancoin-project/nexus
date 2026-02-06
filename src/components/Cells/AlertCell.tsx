import React, {useState, useContext, useLayoutEffect, useCallback} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

import DoriancoinIcon from '../DoriancoinIcon';
import Switch from '../Buttons/Switch';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setAlertAvailability} from '../../reducers/alerts';
import {formatTxDate} from '../../utils/date';
// import {fetchResolve} from '../../utils/tor';

import TranslateText from '../../components/TranslateText';
import {ScreenSizeContext} from '../../context/screenSize';

interface AlertData {
  index: number;
  value: number;
  valueInLocal: string;
  isPositive: boolean;
  isFired: boolean;
  lastTimePriceCache: number;
  lastTimePriceCachedAt: number;
}

interface LastPriceResponse {
  timestamp?: number;
}

interface Props {
  data: AlertData;
  onPress: (index: number) => void;
}

const AlertCell: React.FC<Props> = props => {
  const {data, onPress} = props;

  const {width, height} = useContext(ScreenSizeContext);
  const styles = getStyles(width, height);

  const dispatch = useAppDispatch();
  const currencySymbol = useAppSelector(
    state => state.settings!.currencySymbol,
  );
  // const torEnabled = useAppSelector(state => state.settings!.torEnabled);

  const handleSwitch = useCallback(
    (value: boolean) => {
      dispatch(setAlertAvailability(data.index, value));
    },
    [dispatch, data.index],
  );

  const handlePress = useCallback(() => {
    onPress(data.index);
  }, [onPress, data.index]);

  const [lastTimePrice, setLastTimePrice] = useState('');

  useLayoutEffect(() => {
    // NOTE: nexuswallet.com API is not available for Doriancoin
    // Price last-time lookup is disabled
    if (data.lastTimePriceCache) {
      setLastTimePrice(formatTxDate(data.lastTimePriceCache));
    } else {
      setLastTimePrice('');
    }
  }, [data]);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.topContainer}>
        <View style={styles.subContainer}>
          <DoriancoinIcon size={height * 0.046} />
          <View>
            <View style={styles.subContainer}>
              <TranslateText
                textKey="when_dsv"
                domain="alertsTab"
                maxSizeInPixels={height * 0.02}
                textStyle={styles.text}
                numberOfLines={1}
              />
              <TranslateText
                textValue={' '}
                maxSizeInPixels={height * 0.02}
                textStyle={styles.text}
                numberOfLines={1}
              />
              <TranslateText
                textKey={data.isPositive ? 'above' : 'below'}
                domain="alertsTab"
                maxSizeInPixels={height * 0.02}
                textStyle={styles.lowercaseText}
                numberOfLines={1}
              />
            </View>
            <TranslateText
              textValue={`${currencySymbol}${data.valueInLocal}`}
              maxSizeInPixels={height * 0.025}
              textStyle={styles.valueText}
              numberOfLines={1}
            />
          </View>
        </View>
        <View style={styles.switchContainer}>
          <Switch initialValue={!data.isFired} onPress={handleSwitch} />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        {lastTimePrice ? (
          <TranslateText
            textKey="last_time"
            domain="alertsTab"
            maxSizeInPixels={height * 0.015}
            textStyle={styles.dateText}
            numberOfLines={1}
            interpolationObj={{date: lastTimePrice}}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (screenWidth: number, screenHeight: number) =>
  StyleSheet.create({
    container: {
      height: screenHeight * 0.12,
      borderColor: '#97979748',
      borderBottomWidth: 1,
      backgroundColor: '#fff',
    },
    topContainer: {
      flexBasis: '75%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bottomContainer: {
      flexBasis: '25%',
      justifyContent: 'flex-start',
      paddingHorizontal: screenWidth * 0.04,
    },
    subContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchContainer: {
      justifyContent: 'center',
      paddingRight: screenWidth * 0.04,
    },
    text: {
      color: '#484859',
      fontSize: screenHeight * 0.015,
      fontWeight: '700',
      letterSpacing: -0.18,
    },
    valueText: {
      color: '#2C72FF',
      fontSize: screenHeight * 0.03,
      fontWeight: '700',
      letterSpacing: -0.39,
    },
    dateText: {
      color: '#7C96AE',
      fontSize: screenHeight * 0.013,
      fontWeight: '600',
      letterSpacing: -0.28,
    },
    lowercaseText: {
      color: '#484859',
      fontSize: screenHeight * 0.015,
      fontWeight: '700',
      letterSpacing: -0.18,
      textTransform: 'lowercase',
    },
  });

export default React.memo(AlertCell);
