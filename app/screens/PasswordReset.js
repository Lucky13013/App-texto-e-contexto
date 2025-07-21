import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  Alert, 
  Image,
  StyleSheet 
} from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// As importações do FontAwesome foram removidas.

const PasswordResetScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(t('password_reset.passwords_do_not_match'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`https://textocontexto.pythonanywhere.com/api/forgot/${code}`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
        language: i18n.language
      }, { headers: { 'Content-Type': 'application/json' } });
      Alert.alert(t('password_reset.success'));
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(t('password_reset.error'));
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/icone.png")} style={styles.image} />
      <View style={styles.container2}>
        <Text style={styles.title}>{t('password_reset.title')}</Text>

        <TextInput
          style={styles.input2}
          placeholder={t('password_reset.code')}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('password_reset.new_password')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          {/* SUBSTITUIÇÃO DO ÍCONE POR TEXTO */}
          <TouchableOpacity style={styles.toggleButton} onPress={() => setShowNewPassword(!showNewPassword)}>
            <Text style={styles.toggleButtonText}>
              {showNewPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('password_reset.confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          {/* SUBSTITUIÇÃO DO ÍCONE POR TEXTO */}
          <TouchableOpacity style={styles.toggleButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.toggleButtonText}>
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>{t('password_reset.submit')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef6ff',
  },
  container2: {
    padding: 25,
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor:"#e06eaa",
    borderWidth: 1, // Adicionado para consistência
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1, // Modificado para ocupar o espaço disponível
    padding: 10,
    borderWidth: 1,
    borderColor: '#e06eaa',
    borderRadius: 5,
  },
  input2: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e06eaa',
    borderRadius: 5,
    marginBottom: 10,
    width:"100%"
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%', // Adicionado para garantir alinhamento
  },
  // Estilo antigo do ícone removido (eyeIcon)
  toggleButton: {
    padding: 10,
    marginLeft: 5, // Adicionado um pequeno espaço
  },
  toggleButtonText: {
    color: '#e06eaa',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e06eaa',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  image: {
    width: 130,
    height: 150,
    margin: '5%',
  },
});

export default PasswordResetScreen;
