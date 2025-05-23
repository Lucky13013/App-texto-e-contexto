import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import FavoriteStar from '../../components/ToggleFavorite';
import { useTranslation } from 'react-i18next';
import '../../constants/i18n.js';

export default function ArticleList({ route }) {
  const { fromDate, untilDate } = route.params;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Estado de refresh
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const idioma = i18n.language;

  const parseJson = (jsonString) => {
    try {
      return JSON.parse(jsonString.replace(/\\/g, '').replace(/'/g, '"'));
    } catch (e) {
      return null;
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`https://textocontexto.pythonanywhere.com/api/artigos_por_ano/`, {
        params: { year: fromDate }
      });
      setArticles(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchArticles();
  }, [fromDate, untilDate]);

  const renderItem = ({ item }) => {
    let titulo = item.titulo;
    if (typeof titulo === 'string') {
      titulo = parseJson(titulo);
    }

    return (
      <TouchableOpacity
        style={styles.article}
        onPress={() => navigation.navigate('Tela_de_leitura', { article: item })}
      >
        <Text style={styles.tipetext}>{item.tipo}</Text>
        <Text style={styles.title}>{titulo ? titulo[idioma] || titulo['en'] : 'Título indisponível'}</Text>
        <Text style={styles.date}>{item.data_publicacao}</Text>
        <View style={styles.estrela}>
          <FavoriteStar articleId={item.id} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>{t('Carregando')}</Text>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={handleRefresh}
          refreshing={refreshing}
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e06eaa',
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e06eaa',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tipetext: {
    backgroundColor: '#e06eaa',
    marginHorizontal: "30%",
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    borderRadius: 5,
    marginBottom: '3%'
  },
  estrela: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  date: {
    color: '#666',
    marginTop: 4,
  }
});