import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';

// Navegação
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

// Ícones
import { FontAwesome, Entypo } from '@expo/vector-icons';

// Utilitários e Configurações
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Traduções (i18n)
import './constants/i18n.js';
import { useTranslation } from 'react-i18next';
import i18n from './constants/i18n.js'; // Importando a instância configurada

// Provedores e Componentes
import { FontSizeProvider } from './components/FontSizeProvider';

// Importação de todas as suas telas
import TelaInicial from './app/screens/1TelaInicial';
import Favoritos from './app/screens/2Favoritos';
import Ajustes from './app/screens/3Ajustes';
import Cadastro from './app/screens/Cadastro';
import Loguin from './app/screens/Login';
import Aba_pesquisa from './app/screens/Aba_pesquisa';
import Ajuda from './app/screens/Ajuda';
import Interesses from './app/screens/Interesses';
import Noti from './app/screens/Noti.js';
import Preferencias from './app/screens/Preferencias';
import Sobre_a_revista from './app/screens/Sobre_a_revista';
import Tela_de_leitura from './app/screens/Tela_de_leitura';
import Teste from './app/screens/Testes';
import ArticleList from './app/screens/ArticleList.js';
import Ler_PDF from './app/screens/Ler_PDF.js';
import Tutorial from './app/screens/Tutorial.js';
import SobreOAPp from './app/screens/Sobre_o_APP.js';
import PasswordReset from './app/screens/PasswordReset.js';
import ForgotPassword from './app/screens/ForgotPassword.js';


// --- CONFIGURAÇÕES INICIAIS ---

// Mantém a splash screen visível enquanto o app carrega
SplashScreen.preventAutoHideAsync();

// Configura o Google Sign-In uma única vez
GoogleSignin.configure({
  webClientId: '522347973020-b4aeo7h4af25uhk72flfq2hjsh2cnvsr.apps.googleusercontent.com',
  iosClientId: '522347973020-l71k92fglp4k4d42rra764ksi4edcbjp.apps.googleusercontent.com',
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// --- COMPONENTES DE NAVEGAÇÃO ---

/**
 * Componente para o ícone de notificação com contador.
 */
function NotificationIcon() {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('https://textocontexto.pythonanywhere.com/api/user-notifications/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const unreadCount = response.data.filter(n => !n[1]).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    // Adiciona um listener para focar e atualizar as notificações quando o usuário volta para a tela
    const unsubscribe = navigation.addListener('focus', () => {
        fetchNotifications();
    });

    fetchNotifications(); // Busca inicial

    return unsubscribe; // Limpa o listener ao desmontar
  }, [navigation]);

  const navigateToNotifications = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      navigation.navigate('Noti');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <TouchableOpacity style={{ padding: 10, marginRight: 15 }} onPress={navigateToNotifications}>
      <View>
        <FontAwesome name="bell" size={25} color="#fff" />
        {notificationCount > 0 && (
          <View style={{ position: 'absolute', right: -6, top: -3, backgroundColor: 'red', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notificationCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}


/**
 * Componente que define a Navegação por Abas (Tabs).
 */
function TabNavigator() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#e0e0e0',
        tabBarStyle: { backgroundColor: '#a74e9e', height: 60, paddingTop: 5, paddingBottom: 5 },
        headerStyle: { backgroundColor: '#a74e9e' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerRight: () => <NotificationIcon />,
        headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: 25 }} onPress={() => navigation.navigate('Aba_pesquisa')}>
            <FontAwesome name="search" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={TelaInicial}
        options={{
          title: t('pages.Início'),
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={Favoritos}
        options={{
          title: t('pages.Favoritos'),
          tabBarIcon: ({ color, size }) => <FontAwesome name="star" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={Ajustes}
        options={{
          title: t('pages.Ajustes'),
          tabBarIcon: ({ color, size }) => <Entypo name="dots-three-horizontal" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}


// --- COMPONENTE PRINCIPAL (APP) ---

export default function App() {
  const { t } = useTranslation();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Carrega o idioma salvo
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          await i18n.changeLanguage(savedLanguage);
        }
        
        // Verifica se o tutorial já foi visto
        const tutorialSeen = await AsyncStorage.getItem('tutorialSeen');
        // A lógica de navegação para o tutorial será movida para dentro de um componente de tela
        // para não bloquear a renderização inicial.

      } catch (e) {
        console.warn(e);
      } finally {
        // Informa que o app está pronto para ser exibido
        setIsAppReady(true);
      }
    }

    prepareApp();
  }, []);

  // Esconde a splash screen apenas quando o app estiver pronto.
  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null; // Não renderiza nada até que as preparações estejam completas
  }

  return (
    <SafeAreaProvider>
      <FontSizeProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar barStyle="light-content" backgroundColor="#a74e9e" />
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Tabs">
              {/* Grupo de Telas Principais */}
              <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
              
              {/* Telas que abrem sobre as abas */}
              <Stack.Screen name="Aba_pesquisa" component={Aba_pesquisa} options={{ title: t('pages.Pesquisar'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Ajuda" component={Ajuda} options={{ title: t('pages.Ajuda'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Interesses" component={Interesses} options={{ title: t('pages.Perfil'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Noti" component={Noti} options={{ title: t('pages.Notificações'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Preferencias" component={Preferencias} options={{ title: t('pages.Preferencias'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Sobre_a_revista" component={Sobre_a_revista} options={{ title: t('pages.Sobre a Revista'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Tela_de_leitura" component={Tela_de_leitura} options={{ title: t('pages.artigo'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="ArticleList" component={ArticleList} options={{ title: t('pages.artigos'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Ler_PDF" component={Ler_PDF} options={{ title: "PDF", headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Sobre_o_APP" component={SobreOAPp} options={{ title: t('pages.Sobre o APP'), headerStyle: { backgroundColor: "#a74e9e" }, headerTintColor: "#fff" }} />
              <Stack.Screen name="Teste" component={Teste} />
              
              {/* Grupo de Telas de Autenticação e Onboarding (sem cabeçalho) */}
              <Stack.Screen name="Login" component={Loguin} options={{ headerShown: false }} />
              <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
              <Stack.Screen name="Tutorial" component={Tutorial} options={{ headerShown: false }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
              <Stack.Screen name="PasswordReset" component={PasswordReset} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </FontSizeProvider>
    </SafeAreaProvider>
  );
}
