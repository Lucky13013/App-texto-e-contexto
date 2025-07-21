import { 
  TouchableOpacity, 
  TextInput, 
  BackHandler, 
  Image,
  ActivityIndicator,
  View,
  StyleSheet // Importando StyleSheet
} from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Text } from '../../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import '../../constants/i18n.js';
import { useTranslation } from 'react-i18next';
import { AntDesign } from '@expo/vector-icons';
// A importação do useDynamicStyles foi removida

export default function Loguin() {
  const { t } = useTranslation();
  const senhaPlaceholder = t("login.Senha");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const [check, setCheck] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, insira o email e a senha.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://textocontexto.pythonanywhere.com/api/login/', { email, password }, { headers: { 'Content-Type': 'application/json' } });
      const token = response.data.access;
      await AsyncStorage.setItem('token', token);
      console.log('Login bem-sucedido, token salvo.');
      navigation.navigate(check ? 'Interesses' : 'Tabs');
    } catch (error) {
      alert('Erro ao fazer login. Verifique suas credenciais.');
      console.log('Erro de login:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Tabs');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/icone.png")} style={styles.image}/>
      <View style={styles.conteiner_loguin}>
        <Text style={styles.texto}>
          {t("login.texto1")}
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={senhaPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.toggleButton} onPress={togglePasswordVisibility}>
            <Text style={styles.toggleButtonText}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>{t("login.forgot_your_password")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCheck(!check)} style={styles.checkboxContainer}>
          {check ? <AntDesign name="checksquare" size={24} color="#a74e9e" /> : <AntDesign name="checksquareo" size={24} color="#a74e9e" />}
          <Text style={styles.checkboxLabel}> {t("login.Notificações")} </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size={'large'} color={'#a74e9e'} style={{ marginVertical: 20 }}/>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>{t("login.ENTRAR")}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.Button]} onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.buttonText}>{t("login.Cadastre-se")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos recriados com base na imagem do emulador
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef6ff', // Fundo lilás bem claro
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  conteiner_loguin: {
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0d1e0'
  },
  texto: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    padding: 10,
  },
  toggleButtonText: {
    color: '#a74e9e',
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: '#a74e9e',
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#a74e9e',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
