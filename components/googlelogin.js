import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import axios from 'axios';



export const signInWithGoogle = async () => {
  try {
    // Garantir que o usuário esteja deslogado antes
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();

    const idToken = result.idToken;
    const userData = result.user;

    console.log('✅ Dados do Google retornados:');
    console.log('ID Token:', idToken);
    console.log('Nome:', userData.name);
    console.log('Email:', userData.email);
    console.log('Foto:', userData.photo);
    console.log('ID do usuário:', userData.id);

    if (!idToken) throw new Error('Token de ID não foi retornado');

    const response = await axios.post(
      'https://textocontexto.pythonanywhere.com/api/google-login/',
      { id_token: idToken }
    );

    console.log('🎉 Token do backend:', response.data.access);
    return { success: true, token: response.data.access };

  } catch (error) {
    console.log('❌ Falha no login com Google:', {
      codigo: error.code || 'erro_desconhecido',
      mensagem: error.message
    });
    return { success: false };
  }
};