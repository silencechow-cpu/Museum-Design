/**
 * 国际化功能测试
 * 测试i18next配置和翻译文件的完整性
 */

import { describe, it, expect } from 'vitest';
import i18n from '../client/src/i18n/config';

describe('i18n Configuration', () => {
  it('should initialize with correct default language', () => {
    expect(i18n.language).toBeDefined();
    expect(['zh-CN', 'zh-TW', 'en']).toContain(i18n.language);
  });

  it('should support all three languages', () => {
    const supportedLanguages = i18n.options.supportedLngs;
    expect(supportedLanguages).toContain('zh-CN');
    expect(supportedLanguages).toContain('zh-TW');
    expect(supportedLanguages).toContain('en');
  });

  it('should have fallback language set to zh-CN', () => {
    expect(i18n.options.fallbackLng).toEqual(['zh-CN']);
  });
});

describe('Translation Keys - Common', () => {
  it('should have common translations in all languages', async () => {
    const languages = ['zh-CN', 'zh-TW', 'en'];
    const commonKeys = ['login', 'logout', 'submit', 'cancel', 'save', 'edit', 'delete'];

    for (const lang of languages) {
      await i18n.changeLanguage(lang);
      for (const key of commonKeys) {
        const translation = i18n.t(`common.${key}`);
        expect(translation).toBeDefined();
        expect(translation).not.toBe(`common.${key}`); // Should not return the key itself
      }
    }
  });
});

describe('Translation Keys - Navigation', () => {
  it('should have navigation translations in all languages', async () => {
    const languages = ['zh-CN', 'zh-TW', 'en'];
    const navKeys = ['home', 'museums', 'works', 'designers', 'profile'];

    for (const lang of languages) {
      await i18n.changeLanguage(lang);
      for (const key of navKeys) {
        const translation = i18n.t(`nav.${key}`);
        expect(translation).toBeDefined();
        expect(translation).not.toBe(`nav.${key}`);
      }
    }
  });
});

describe('Translation Keys - Site', () => {
  it('should have site translations in all languages', async () => {
    const languages = ['zh-CN', 'zh-TW', 'en'];
    const siteKeys = ['title', 'tagline'];

    for (const lang of languages) {
      await i18n.changeLanguage(lang);
      for (const key of siteKeys) {
        const translation = i18n.t(`site.${key}`);
        expect(translation).toBeDefined();
        expect(translation).not.toBe(`site.${key}`);
      }
    }
  });
});

describe('Language Switching', () => {
  it('should switch between languages correctly', async () => {
    await i18n.changeLanguage('zh-CN');
    expect(i18n.t('common.login')).toBe('登录');

    await i18n.changeLanguage('zh-TW');
    expect(i18n.t('common.login')).toBe('登入');

    await i18n.changeLanguage('en');
    expect(i18n.t('common.login')).toBe('Login');
  });

  it('should translate site title correctly in all languages', async () => {
    await i18n.changeLanguage('zh-CN');
    expect(i18n.t('site.title')).toBe('古韵新创');

    await i18n.changeLanguage('zh-TW');
    expect(i18n.t('site.title')).toBe('古韻新創');

    await i18n.changeLanguage('en');
    expect(i18n.t('site.title')).toBe('Heritage Reimagined');
  });
});

describe('Translation Completeness', () => {
  it('should have the same keys in all language files', async () => {
    const zhCN = await import('../client/src/i18n/locales/zh-CN.json');
    const zhTW = await import('../client/src/i18n/locales/zh-TW.json');
    const en = await import('../client/src/i18n/locales/en.json');

    const zhCNKeys = Object.keys(zhCN.default);
    const zhTWKeys = Object.keys(zhTW.default);
    const enKeys = Object.keys(en.default);

    expect(zhCNKeys.sort()).toEqual(zhTWKeys.sort());
    expect(zhCNKeys.sort()).toEqual(enKeys.sort());
  });
});
