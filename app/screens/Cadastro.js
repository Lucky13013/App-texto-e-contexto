import { 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleSheet 
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { Text } from '../../components/Themed';
import { useNavigation } from '@react-navigation/native';
import '../../constants/i18n.js';
import { useTranslation } from 'react-i18next';

// As importações do FontAwesome foram removidas.

export default function Cadastro() {

  const { t } = useTranslation();
  const Nome = t("cadastro.Nome");
  const Senha = t("cadastro.Senha");
  const Confirmar = t("cadastro.Confirmar Senha");
  const [nome, setnome] = useState('');
  const [email, setemail] = useState('');
  const [senha, setsenha] = useState('');
  const [confirmarSenha, setconfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
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
                secureTextEntry={!senhaVisivel}
                autoCapitalize="none"
              />
              {/* SUBSTITUIÇÃO DO ÍCONE POR TEXTO */}
              <TouchableOpacity style={styles.toggleButton} onPress={togglePasswordVisibility}>
                <Text style={styles.toggleButtonText}>
                  {senhaVisivel ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={Confirmar}
                value={confirmarSenha}
                onChangeText={(texto) => setconfirmarSenha(texto)}
                secureTextEntry={!confirmarSenhaVisivel}
                autoCapitalize="none"
              />
              {/* SUBSTITUIÇÃO DO ÍCONE POR TEXTO */}
              <TouchableOpacity style={styles.toggleButton} onPress={toggleConfirmPasswordVisibility}>
                <Text style={styles.toggleButtonText}>
                  {confirmarSenhaVisivel ? 'Ocultar' : 'Mostrar'}
                </Text>
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
  // Estilo antigo do ícone removido (eyeIcon)
  // Novo estilo para o botão de texto
  toggleButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#e06eaa',
    fontWeight: 'bold',
  },
});
