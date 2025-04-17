import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { useTranslation } from 'react-i18next';
import Orientation from 'react-native-orientation-locker';

export default function Ler_PDF({ route }) {
  const { article } = route.params;
  const { i18n } = useTranslation();
  const [updatedPdfUrl, setUpdatedPdfUrl] = useState(article.link_pdf);

  // Controle de orientação
  useEffect(() => {
    // Libera todas as orientações ao entrar na tela
    Orientation.unlockAllOrientations();
    
    return () => {
      // Força retrato ao sair da tela
      Orientation.lockToPortrait();
    };
  }, []);

  // Atualização da URL do PDF
  useEffect(() => {
    let newPdfUrl = article.link_pdf
      .replace(/lng=[^&]*/, `lng=${i18n.language}`)
      .replace(/tlng=[^&]*/, `tlng=${i18n.language}`);

    if (newPdfUrl.startsWith('http:')) {
      newPdfUrl = newPdfUrl.replace('http:', 'https:');
    }

    setUpdatedPdfUrl(newPdfUrl);
  }, [i18n.language, article.link_pdf]);

  return (
    <View style={{ flex: 1 }}>
      {updatedPdfUrl ? (
        <Pdf
          trustAllCerts={false}
          source={{ uri: updatedPdfUrl, cache: true }}
          onError={(error) => console.log(error)}
          style={{ flex: 1 }}
          renderActivityIndicator={() => (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
        />
      ) : (
        <Text>Unable to load PDF.</Text>
      )}
    </View>
  );
}