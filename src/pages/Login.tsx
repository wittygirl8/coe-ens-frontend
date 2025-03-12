import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';

import classes from '../styles/AuthenticationTitle.module.css';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value: string) =>
        value.length < 3 ? 'Email must have at least 3 letters' : null,
      password: (value: string) =>
        value.length < 3 ? 'Password must have at least 3 letters' : null,
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => axios.post('/api/auth/login', payload),
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        position: 'top-right',
        color: 'red',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.containerContent} w={420} my={40}>
        <Title ta='center' c='white' className={classes.title}>
          Welcome back!
        </Title>
        <Text size='sm' ta='center' c='white' mt={5}>
          Do not have an account yet?{' '}
          <Anchor size='sm' component='button'>
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow='md' p={30} mt={30} radius='md'>
          <form
            onSubmit={form.onSubmit((values: FormValues) => onSubmit(values))}
          >
            <TextInput
              autoFocus
              label='Email'
              placeholder='Enter Email'
              withAsterisk
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label='Password'
              placeholder='Enter password'
              mt='md'
              withAsterisk
              {...form.getInputProps('password')}
            />
            <Group justify='space-between' mt='lg'>
              <Checkbox label='Remember me' />
              <Anchor component='button' size='sm'>
                Forgot password?
              </Anchor>
            </Group>
            <Button type='submit' fullWidth mt='xl'>
              Sign in
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
