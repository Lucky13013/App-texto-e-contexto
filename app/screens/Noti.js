import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import '../../constants/i18n.js';
import { FontAwesome } from '@expo/vector-icons';

export default function Noti() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const idioma = i18n.language;

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token not found');
        return;
      }
      const [articlesResponse, notificationsResponse] = await Promise.all([
        axios.get('https://textocontexto.pythonanywhere.com/api/articles-notifications/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('https://textocontexto.pythonanywhere.com/api/user-notifications/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const notificacoesBool = notificationsResponse.data;
      const articles = articlesResponse.data.map(article => {
        const lido = notificacoesBool.some(notificacao => notificacao[0] === article.id && notificacao[1]);
        return { ...article, lido };
      });

      setNotificacoes(articles);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const parseJson = (jsonString) => {
    try {
      return JSON.parse(jsonString.replace(/\\/g, '').replace(/'/g, '"'));
    } catch (e) {
      return null;
    }
  };

  const handleArticlePress = async (article) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`https://textocontexto.pythonanywhere.com/api/user-notifications/${article.id}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Navega para a tela de leitura e marca o artigo como lido
      navigation.navigate('Tela_de_leitura', { article });
      setNotificacoes(prevState =>
        prevState.map(item =>
          item.id === article.id ? { ...item, lido: true } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const removeNotification = async (articleId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`https://textocontexto.pythonanywhere.com/api/notifications/remove/${articleId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotificacoes(prevState => prevState.filter(item => item.id !== articleId));
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    let titulo = item.titulo;
    if (typeof titulo === 'string') {
      titulo = parseJson(titulo);
    }

    return (
      <View style={[styles.article, item.lido && styles.articleLido]}>
        <TouchableOpacity onPress={() => handleArticlePress(item)} style={styles.articleContent}>
          <Text style={styles.tipetext}>{item.tipo}</Text>
          <Text style={styles.title}>{titulo ? titulo[idioma] || titulo['en'] : 'Título indisponível'}</Text>
          <View style={{flexDirection:'row',justifyContent:"space-between"}}>
          <Text style={styles.date}>{item.data_publicacao}</Text>
          <TouchableOpacity onPress={() => removeNotification(item.id)} style={styles.trashButton}>
            <FontAwesome name="trash-o" size={24} color="black"style={styles.trashText} />
          </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.separator_80}></View>
      {loading ? <Text>Loading...</Text> : (
        <FlatList
          data={notificacoes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fef6ff',
  },
  article: {
    padding: 16,
    margin: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e06eaa',
    elevation: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleLido: {
    backgroundColor: '#e6e6e6', // Cor diferente para artigos lidos
  },
  articleContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  tipetext: {
    backgroundColor: '#e06eaa',
    marginHorizontal: "30%",
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding:5
  },
  date: {
 
  },
  separator_80: {
    marginVertical: 20,
  },
  trashButton: {
    padding: 10,
  },
  trashText: {
    flexDirection:"row"
  },

});