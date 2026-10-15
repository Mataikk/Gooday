import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth, type AuthError } from '@/auth/auth-context';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 30;

// User-facing messages (French).
const AUTH_ERRORS: Record<AuthError, string> = {
  'invalid-credentials': 'Prénom ou mot de passe incorrect.',
  'name-taken': 'Ce prénom est déjà utilisé sur ce téléphone.',
  unknown: 'Une erreur est survenue. Réessaie.',
};

type Mode = 'sign-in' | 'sign-up';

export default function LoginScreen() {
  const theme = useTheme();
  const { hasAccounts, signIn, signUp } = useAuth();

  // First launch: nobody has an account yet, so start on the sign-up form.
  const [mode, setMode] = useState<Mode>(hasAccounts ? 'sign-in' : 'sign-up');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isSignUp = mode === 'sign-up';

  const switchMode = () => {
    setMode(isSignUp ? 'sign-in' : 'sign-up');
    setPassword('');
    setConfirm('');
    setError(null);
  };

  /** Returns a French error message, or null if the form is valid. */
  const validate = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Indique ton prénom.';
    if (trimmed.length > MAX_NAME_LENGTH)
      return `Ton prénom doit faire au maximum ${MAX_NAME_LENGTH} caractères.`;
    if (!password) return 'Indique ton mot de passe.';
    if (isSignUp) {
      if (password.length < MIN_PASSWORD_LENGTH)
        return `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`;
      if (password !== confirm) return 'Les deux mots de passe ne correspondent pas.';
    }
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = isSignUp ? await signUp(name, password) : await signIn(name, password);
    // On success the auth guard swaps this screen for the journal.
    if (result) {
      setError(AUTH_ERRORS[result]);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">
          <View style={styles.brand}>
            <ThemedText style={styles.logo}>Gooday</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.tagline}>
              Ton journal, une journée à la fois.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.heading}>
              {isSignUp ? 'Crée ton compte' : 'Content de te revoir'}
            </ThemedText>

            <TextField
              label="Prénom"
              value={name}
              onChangeText={setName}
              placeholder="Ton prénom"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete={isSignUp ? 'given-name' : 'username'}
              textContentType={isSignUp ? 'givenName' : 'username'}
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />

            <TextField
              ref={passwordRef}
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder={isSignUp ? `Au moins ${MIN_PASSWORD_LENGTH} caractères` : 'Ton mot de passe'}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              returnKeyType={isSignUp ? 'next' : 'done'}
              onSubmitEditing={() => (isSignUp ? confirmRef.current?.focus() : submit())}
              submitBehavior={isSignUp ? 'submit' : 'blurAndSubmit'}
            />

            {isSignUp && (
              <TextField
                ref={confirmRef}
                label="Confirme le mot de passe"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Le même mot de passe"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            )}

            {error && (
              <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
                {error}
              </ThemedText>
            )}

            <Button
              title={isSignUp ? 'Créer mon compte' : 'Se connecter'}
              onPress={submit}
              loading={submitting}
            />

            {(hasAccounts || !isSignUp) && (
              <Pressable onPress={switchMode} hitSlop={8} style={styles.switch}>
                <ThemedText type="small" themeColor="textSecondary">
                  {isSignUp ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
                  <ThemedText type="smallBold" themeColor="accent">
                    {isSignUp ? 'Se connecter' : 'Créer un compte'}
                  </ThemedText>
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
            Ton journal reste sur ce téléphone : rien n’est envoyé sur Internet.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  brand: { alignItems: 'center', gap: Spacing.one },
  logo: { fontFamily: Fonts.serif, fontSize: 48, lineHeight: 56, fontWeight: 700 },
  tagline: { fontFamily: Fonts.serif, fontSize: 17, textAlign: 'center' },
  form: { gap: Spacing.three },
  heading: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 32, fontWeight: 600 },
  switch: { alignSelf: 'center', paddingVertical: Spacing.two },
  footnote: { textAlign: 'center' },
});
