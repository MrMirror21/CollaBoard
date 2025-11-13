module.exports = {
    extends: [
      'airbnb',
      'airbnb-typescript',
      'airbnb/hooks',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      // 프로젝트 스타일에 맞게 직접 조정
      'react/react-in-jsx-scope': 'off',
      'import/prefer-default-export': 'off',
    },
  }
}