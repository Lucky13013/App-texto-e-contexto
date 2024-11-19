import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share'; // Importar biblioteca de compartilhamento
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const Tela_de_leitura = ({ route }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const { article } = route.params;
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  const parseJson = (jsonString) => {
    try {
      const formattedString = jsonString.replace(/'/g, '"');
      return JSON.parse(formattedString);
    } catch (e) {
      return null;
    }
  };

  const checkFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await fetch('https://textocontexto.pythonanywhere.com/api/list-favorites/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('Unauthorized: Check your token');
        return;
      }

      const data = await response.json();

      if (data.favorites.includes(article.id)) {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`https://textocontexto.pythonanywhere.com/api/toggle-favorite/${article.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('Unauthorized: Check your token');
        return;
      }

      const data = await response.json();
      console.log(data.message);

      setIsFavorite(prevState => !prevState);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    checkFavorite();
  }, [article.id]);

  const resumo = parseJson(article.resumo);
  const palavrasChave = parseJson(article.palavras_chave);
  const autores = parseJson(article.autores);
  const linksHtml = parseJson(article.links_html);
  const titulo = parseJson(article.titulo);

  const idioma = i18n.language;
  const tituloT = titulo ? titulo[idioma] || titulo['en'] : 'Título indisponível';
  const resumoTexto = resumo ? resumo[idioma] || 'Resumo não disponível' : 'Resumo não disponível';
  const descritoresTexto = palavrasChave ? (palavrasChave[idioma] || []).join(', ') : 'Descritores não disponíveis';
  const autoresTexto = autores ? autores.map(a => `${a.given_names} ${a.surname}`).join(', ') : 'Autores não disponíveis';
  const linkHtml = linksHtml && linksHtml.html && linksHtml.html[idioma] ? linksHtml.html[idioma] : null;

  // Sistemas para download --------------------------------------------------

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const androidVersion = parseInt(Platform.Version, 10);
      
      try {
        if (androidVersion < 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Permissão de Armazenamento',
              message: 'O aplicativo precisa de acesso ao armazenamento para baixar arquivos.',
              buttonNeutral: 'Pergunte-me depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Permissão de Leitura',
              message: 'O aplicativo precisa de acesso ao armazenamento para baixar arquivos.',
              buttonNeutral: 'Pergunte-me depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const status = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
      if (status !== RESULTS.GRANTED) {
        const result = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
        return result === RESULTS.GRANTED;
      }
      return true;
    }
  };
  
  const downloadPDF = async (url, filename) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Erro', 'Permissão de armazenamento negada.');
      return;
    }
  
    const path = Platform.OS === 'android' && parseInt(Platform.Version, 10) >= 29
      ? `${RNFS.DocumentDirectoryPath}/${filename}`
      : `${RNFS.DownloadDirectoryPath}/${filename}`;
  
    if (Platform.OS === 'ios') {
      path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    }
  
    try {
      const response = await RNFS.downloadFile({
        fromUrl: url,
        toFile: path,
      }).promise;
  
      if (response.statusCode === 200) {
        Alert.alert('Sucesso', 'PDF baixado com sucesso.');
        
        // Compartilhe o PDF para garantir acesso direto
        await Share.open({
          url: `file://${path}`,
          type: 'application/pdf',
          title: 'Abrir PDF',
        });
      } else {
        Alert.alert('Erro', 'Falha ao baixar o PDF.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao baixar o PDF.');
      console.error(error);
    }
  };

  //--------------------------------------------------------

  const pdfUrl = article.link_pdf;

  // Atualizar o link com a linguagem do i18n
  const updatedPdfUrl = pdfUrl
    .replace(/lng=[^&]*/, `lng=${i18n.language}`)
    .replace(/tlng=[^&]*/, `tlng=${i18n.language}`);

  // Função de compartilhamento
  const shareArticle = async () => {
    const shareOptions = {
      title: tituloT,
      message: `${tituloT}\n\n${resumoTexto}\n\n${linkHtml}`,
      url: linkHtml,
      subject: tituloT, // para o email
    };

    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.tipetext}>{article.tipo}</Text>
        <View style={styles.fundoTexto}>
          <Text style={styles.title}>{tituloT}</Text>
          <Text style={styles.texto}>{t("Leitura.Data de Publicação")}</Text>
          <Text>{article.data_publicacao}</Text>
        </View>
        <View style={styles.separator_80} />
        <View style={styles.fundoTexto}>
          <Text style={styles.texto}>Autores</Text>
          <Text>{autoresTexto}</Text>
        </View>
        <View style={styles.separator_80} />
        <View style={styles.fundoTexto}>
          <Text style={styles.texto}>Descritores</Text>
          <Text>{descritoresTexto}</Text>
        </View>
        <View style={styles.separator_80} />
        <View style={styles.fundoTexto}>
          <Text>{resumoTexto}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Tabs")}>
          <Ionicons name="home" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={shareArticle}>
          <Ionicons name="share-social" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Ler_PDF", { article })}>
          <FontAwesome name="file-pdf-o" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openLink(linkHtml)}>
          <Ionicons name="reader" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => downloadPDF(updatedPdfUrl, `${tituloT}.pdf`)}>
          <Ionicons name="download" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  texto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator_80: {
    height: 1,
    width: '90%',
    backgroundColor: "#e06eaa",
    alignSelf: "center",
    marginVertical: 10,
  },
  footer: {
    padding: "4%",
    backgroundColor: '#a74e9e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // Extra padding para evitar conteúdo cortado
  },
  tipetext: {
    fontWeight: "bold",
    fontSize: 15,
    backgroundColor: "#a74e9e",
    width:`35%`,
    padding:5,
    borderRadius:8,
    alignSelf:`center`,
    color:`#ffff`,
    textAlign:`center`
  },
  fundoTexto: {
    padding: "3%",
    borderRadius: 10,
    marginBottom: 10,
  }
});

export default Tela_de_leitura;