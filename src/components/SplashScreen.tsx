import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreenCustom: React.FC<SplashScreenProps> = ({ onFinish }) => {
    useEffect(() => {
        const prepare = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            onFinish();
        };

        prepare();
    }, [onFinish]);

    return (
        <View className="flex-1 bg-white items-center justify-center absolute w-full h-full z-50">
            <Image
                source={require('../../assets/splashScreenImage.png')}
                className="w-full h-full"
                resizeMode="cover"
            />
        </View>
    );
};

export default SplashScreenCustom;
