import { 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { Text } from '../../components/Themed';
import { useNavigation } from '@react-navigation/native';
import '../../constants/i18n.js';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Importação dos ícones
import { StyleSheet } from 'react-native';

export default function Cadastro() {

  const { t } = useTranslation();
  const Nome = t("cadastro.Nome");
  const Senha = t("cadastro.Senha");
  const Confirmar = t("cadastro.Confirmar Senha");
  const [nome, setnome] = useState('');
  const [email, setemail] = useState('');
  const [senha, setsenha] = useState('');
  const [confirmarSenha, setconfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false); // Estado para controle da visibilidade da senha
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false); // Estado para controle da visibilidade da confirmação de senha
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setSenhaVisivel(!senhaVisivel);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmarSenhaVisivel(!confirmarSenhaVisivel);
  };

  const handleCadastroPress = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://textocontexto.pythonanywhere.com/api/users/', 
      { 'name': nome, 'email': email, 'password': senha, 'is_adm': false });
      console.log(response);
      navigation.navigate('Login');
    } catch (error) {
      console.log(error);
      alert('Erro ao fazer o cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.inner}>
          <Image source={require('../../assets/images/Kit Portal de Periódicos_Thumbnail.png')} style={styles.image3}></Image>

          <View style={styles.conteiner_loguin}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={Nome}
                value={nome}
                onChangeText={(texto) => setnome(texto)}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(texto) => setemail(texto)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={Senha}
                value={senha}
                onChangeText={(texto) => setsenha(texto)}
                secureTextEntry={!senhaVisivel} // Controle de visibilidade da senha
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                <FontAwesomeIcon
                  icon={senhaVisivel ? faEye : faEyeSlash} // Alterna entre os ícones de olho
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={Confirmar}
                value={confirmarSenha}
                onChangeText={(texto) => setconfirmarSenha(texto)}
                secureTextEntry={!confirmarSenhaVisivel} // Controle de visibilidade da confirmação de senha
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
                <FontAwesomeIcon
                  icon={confirmarSenhaVisivel ? faEye : faEyeSlash} // Alterna entre os ícones de olho
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size={'large'} color={'#333'} /> :
              <TouchableOpacity style={styles.button} onPress={handleCadastroPress}>
                <Text style={styles.buttonText}>{t("cadastro.CADASTRAR")}</Text>
              </TouchableOpacity>
            }
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffff',
  },
  image3: {
    width: 200, 
    height: 200,
    marginBottom: 40,
  },
  conteiner_loguin: {
    width: '100%',
    backgroundColor: '#ffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e06eaa',
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e06eaa',
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#e06eaa',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});