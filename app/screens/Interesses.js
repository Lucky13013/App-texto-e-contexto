import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import '../../constants/i18n';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

export default function Interesses() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const [descritores, setDescritores] = useState({});
  const [filteredDescritores, setFilteredDescritores] = useState([]);
  const [selectedDescritores, setSelectedDescritores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.navigate('Login');
        } else {
          const response = await fetch('https://textocontexto.pythonanywhere.com/api/users/', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUserName(data[0].name);
        }
      } catch (error) {
        console.log('Erro ao verificar autenticação:', error);
      }
    };

    const fetchInitialData = async () => {
      await checkAuth();
      await fetchDescritores();
      await fetchFavoritos();
    };

    fetchInitialData();
  }, []);

  const fetchDescritores = async () => {
    try {
      const response = await fetch('https://textocontexto.pythonanywhere.com/api/keywords/');
      const data = await response.json();
      setDescritores(data);
      setFilteredDescritores(data[i18n.language] || []);
    } catch (error) {
      console.error('Erro ao buscar descritores:', error);
    }
  };

  const fetchFavoritos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token não encontrado');
        return;
      }

      const response = await fetch('https://textocontexto.pythonanywhere.com/api/list-temas_preferidos/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('Não autorizado: Verifique seu token');
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSelectedDescritores(data);
      } else {
        console.error('Esperado um array de favoritos, mas recebido:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  };

  const handleSearch = () => {
    const descritoresList = descritores[i18n.language] || [];
    if (search) {
      const filtered = descritoresList.filter((descritor) =>
        descritor.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDescritores(filtered);
    } else {
      setFilteredDescritores(descritoresList);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setFilteredDescritores(descritores[i18n.language] || []);
  };

  const toggleDescritor = async (descritor) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token não encontrado');
        return;
      }

      const response = await fetch(`https://textocontexto.pythonanywhere.com/api/toggle-temas-preferidos/${descritor}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('Não autorizado: Verifique seu token');
        return;
      }

      const data = await response.json();
      console.log(data.message);

      const updatedDescritores = [...selectedDescritores];
      const index = updatedDescritores.indexOf(descritor);

      if (index > -1) {
        updatedDescritores.splice(index, 1);
      } else {
        updatedDescritores.push(descritor);
      }

      setSelectedDescritores(updatedDescritores);
    } catch (error) {
      console.log('Erro ao alternar descritor:', error);
    }
  };

  const renderDescritor = ({ item }) => (
    <TouchableOpacity onPress={() => toggleDescritor(item)}>
      <View style={styles.Link3}>
        <Text style={selectedDescritores.includes(item) ? styles.selectedText : styles.text}>{item}</Text>
        {selectedDescritores.includes(item) ? <AntDesign name="checksquare" size={24} color="#e06eaa" /> : <AntDesign name="checksquareo" size={24} color="#e06eaa" />}
      </View>
    </TouchableOpacity>
  );

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      console.log('Token deletado');
      navigation.navigate('Tabs');
    } catch (e) {
      console.error('Erro ao fazer logout:', e);
    }
  };

  const loadMoreDescritores = () => {
    if (currentPage * itemsPerPage < filteredDescritores.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const startIndex = 0;
  const endIndex = currentPage * itemsPerPage;
  const paginatedDescritores = filteredDescritores.slice(startIndex, endIndex);

  return (
    <SafeAreaView style={styles.container_JS}>
      {/* Caixa superior que ocupa 1/3 da tela */}
      <View style={styles.Caixa_superior}>
        <Text style={styles.title}>{userName}</Text>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.texto2}>{t("preferencias.SAIR")}</Text>
          <Feather name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Caixa inferior com FlatList que ocupa 2/3 da tela */}
      <View style={styles.Caixa_inferior}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder={t("interesses.Pesquisar descritores...")}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={paginatedDescritores}
          renderItem={renderDescritor}
          keyExtractor={(item) => item}
          onEndReached={loadMoreDescritores}
          onEndReachedThreshold={0.8}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container_JS: {
    flex: 1,
    backgroundColor: '#fef6ff',
  },
  Caixa_superior: {
    flex: 1, // Ocupa 1/3 da tela
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  Caixa_inferior: {
    flex: 2, // Ocupa 2/3 da tela
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e06eaa',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
  },
  clearButton: {
    marginLeft: 5,
  },
  searchButton: {
    marginLeft: 5,
  },
  Link3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    flex: 1,
    marginRight: 10,
  },
  selectedText: {
    flex: 1,
    marginRight: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#a74e9e',
    width: '70%',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  texto2: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
});