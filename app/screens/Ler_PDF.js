import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { useTranslation } from 'react-i18next';

export default function Ler_PDF({ route }) {
  const { article } = route.params;
  const { i18n } = useTranslation();
  const [updatedPdfUrl, setUpdatedPdfUrl] = useState(article.link_pdf);

  useEffect(() => {
    // Atualizar o link com a linguagem do i18n
    let newPdfUrl = article.link_pdf
      .replace(/lng=[^&]*/, `lng=${i18n.language}`)
      .replace(/tlng=[^&]*/, `tlng=${i18n.language}`);

    // Adicionar "s" ao "http" para tornar "https"
    if (newPdfUrl.startsWith('http:')) {
      newPdfUrl = newPdfUrl.replace('http:', 'https:');
    }

    // Atualizar o estado com o novo link
    setUpdatedPdfUrl(newPdfUrl);
  }, [i18n.language, article.link_pdf]);

  console.log('Antigo link:', article.link_pdf);
  console.log('Novo link:', updatedPdfUrl);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {updatedPdfUrl ? (
        <Pdf
          trustAllCerts={false}
          source={{ uri: updatedPdfUrl, cache: true }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {}}
          onError={(error) => {
            console.log(error);
          }}
          style={{ flex: 1, width: '100%' }}
          renderActivityIndicator={() => <ActivityIndicator size="large" color="#0000ff" />}
        />
      ) : (
        <Text>Unable to load PDF.</Text>
      )}
    </View>
  );
}