module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.appcontacts.AppContactsPackage;',
        packageInstance: 'new AppContactsPackage()',
      },
      ios: {
        podspecPath: 'app-contacts.podspec',
      },
    },
  },
};
