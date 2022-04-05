import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Plus } from 'tabler-icons-react';
import { Button, Group, Modal, Space, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { http } from '../../../services/http.service';
import { useModals } from '@mantine/modals';
import { useDispatch } from 'react-redux';
import { setData } from '../../../store/ducks/global.duck';
import { useNavigate } from 'react-router-dom';

import './NewProject.scss';

const NewProject: FC = () => {
  const modals = useModals();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { url: '' },
    validate: {
      url: value => value.indexOf('open.spotify.com/') === -1 ? 'URL Inválida' : null,
    },
  });

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => setOpened(p => !p);

  useEffect(
    () => { 
      if (opened) {
        setTimeout(() => inputRef.current && inputRef.current.focus(), 150);
      }
    },
    [opened]
  );

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const data = await http.post('/fetch', values).then(r => r.data);
      dispatch(setData(data));
      navigate('/dashboard');
    } catch (e) {
      modals.openModal({
        closeOnEscape: false,
        closeOnClickOutside: false,
        title: 'Erro ao buscar dados',
        children: <Text>Não foi possível buscar os dados a partir da url informada.</Text>,
        zIndex: 300,
      });
    }
    setLoading(false);
  };

  const submit = form.onSubmit(onSubmit);

  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      submit(e);
    }
  };

  return (
    <div className="new-project">
      <div className="wrapper">
        <button className="np-button" onClick={toggle}>
          <div className="icon"><Plus /></div>
          <label>Novo Projeto</label>
        </button>
      </div>
      <Modal
        opened={opened}
        onClose={toggle}
        title="Insira a URL do Spotify"
      >
        <TextInput
          ref={inputRef}
          onKeyUp={onKeyUp}
          required={true}
          placeholder="https://open.spotify.com/album"
          {...form.getInputProps('url')}
        />
        <Space h="md" />
        <Group position="right">
          <Button onClick={submit} loading={loading}>Iniciar</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default NewProject;
