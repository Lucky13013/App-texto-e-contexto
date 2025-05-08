import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import '../../constants/i18n.js';
import { useTranslation } from 'react-i18next';
import FavoriteStar from '../../components/ToggleFavorite.js';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState('default');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const idioma = i18n.language;

  useEffect(() => {
    fetchFavoritos();
  }, [order]);

  const fetchFavoritos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`https://textocontexto.pythonanywhere.com/api/favoritos/?order=${order}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavoritos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavoritos();
  };

  const parseJson = (jsonString) => {
    try {
      return JSON.parse(jsonString.replace(/\\/g, '').replace(/'/g, '"'));
    } catch (e) {
      return null;
    }
  };

  const getFiltered = () => {
    if (!search.trim()) return favoritos;

    return favoritos.filter(article => {
      const lowerSearch = search.toLowerCase();

      const hasKeyword = article.palavras_chave?.toLowerCase().includes(lowerSearch);
      const hasAuthor = Array.isArray(article.autores) && article.autores.some(a => a.toLowerCase().includes(lowerSearch));
      const hasTitle = typeof article.titulo === 'object' && Object.values(article.titulo).some(title => title.toLowerCase().includes(lowerSearch));

      return hasKeyword || hasAuthor || hasTitle;
    });
  };

  const renderItem = ({ item }) => {
    let titulo = typeof item.titulo === 'string' ? parseJson(item.titulo) : item.titulo;

    return (
      <TouchableOpacity
        style={styles.article}
        onPress={() => navigation.navigate('Tela_de_leitura', { article: item })}
      >
        <Text style={styles.tipetext}>{item.tipo}</Text>
        <Text style={styles.title}>{titulo?.[idioma] || titulo?.en || 'Título indisponível'}</Text>
        <Text style={styles.date}>{item.data_publicacao}</Text>
        <View style={styles.estrela}>
          <FavoriteStar articleId={item.id} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.caixa_pesquisa}>
        <AntDesign name="search1" size={30} color="#e06eaa" />
        <TextInput
          placeholder={t('pesquisa.Buscar')}
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.separator_80} />

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!isDropdownVisible)}
        >
          <Text style={styles.dropdownButtonText}>
            {order === 'oldest' && t("Favoritos.Antigos")}
            {order === 'newest' && t("Favoritos.Novos")}
            {order === 'recent_added' && t("Favoritos.Recentemente Adicionados")}
            {order === 'default' && t("Favoritos.Últimos Adicionados")}
          </Text>
          <AntDesign name={isDropdownVisible ? 'up' : 'down'} size={30} color="#fff" />
        </TouchableOpacity>
        {isDropdownVisible && (
          <View style={styles.dropdownOptions}>
            {['oldest', 'newest', 'recent_added', 'default'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownOption, order === opt && styles.dropdownOptionSelected]}
                onPress={() => handleOrderChange(opt)}
              >
                <Text style={[styles.dropdownOptionText, order === opt && styles.dropdownOptionTextSelected]}>
                  {t(`Favoritos.${opt === 'default' ? 'Últimos Adicionados' : opt === 'recent_added' ? 'Recentemente Adicionados' : opt === 'newest' ? 'Novos' : 'Antigos'}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.separator_80} />

      {loading ? (
        <Text style={styles.carregando}>{t('Carregando')}</Text>
      ) : (
        <FlatList
          data={getFiltered()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReachedThreshold={0.5}
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
  },
  caixa_pesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 2,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: '#e06eaa',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  separator_80: {
    marginVertical: 20,
  },
  estrela:{
    flexDirection:'row',
    justifyContent:'flex-end'
  },
  dropdownContainer: {
    marginHorizontal: 20,
  },
  dropdownButton: {
    backgroundColor: '#e06eaa',
    padding: 10,
    borderRadius: 5,
    flexDirection:'row',
    justifyContent:"space-between"
  },
  dropdownButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize:16
  },
  dropdownOptions: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e06eaa',
    marginTop: 10,
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownOptionText: {
    color: '#e06eaa',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dropdownOptionSelected: {
    backgroundColor: '#e06eaa',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
  },
  carregando: {
    alignContent: 'center',
    justifyContent: 'center',
    width: '50%'
  }
});