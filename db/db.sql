PGDMP  8                    }            meetings    16.3    16.3     W           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            X           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            Y           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            Z           1262    29298    meetings    DATABASE     �   CREATE DATABASE meetings WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE meetings;
                postgres    false            J          0    29349    access_rights 
   TABLE DATA           ?   COPY public.access_rights (id, title, description) FROM stdin;
    public          postgres    false    224   T       B          0    29300    worker 
   TABLE DATA           >   COPY public.worker (id, username, email, chat_id) FROM stdin;
    public          postgres    false    216           D          0    29316    leader 
   TABLE DATA           /   COPY public.leader (id, worker_id) FROM stdin;
    public          postgres    false    218   �       F          0    29328    team 
   TABLE DATA           4   COPY public.team (id, title, leader_id) FROM stdin;
    public          postgres    false    220   �       P          0    29404    meeting 
   TABLE DATA           :   COPY public.meeting (id, date, type, team_id) FROM stdin;
    public          postgres    false    230   �       T          0    29439    mark 
   TABLE DATA           L   COPY public.mark (id, meeting_id, worker_id, can_be_in_meeting) FROM stdin;
    public          postgres    false    234          R          0    29422    notification 
   TABLE DATA           I   COPY public.notification (id, meeting_id, worker_id, status) FROM stdin;
    public          postgres    false    232   =       H          0    29341    role 
   TABLE DATA           )   COPY public.role (id, title) FROM stdin;
    public          postgres    false    222   Z       L          0    29359    role_access_rights 
   TABLE DATA           K   COPY public.role_access_rights (id, role_id, access_rights_id) FROM stdin;
    public          postgres    false    226   �       N          0    29376    worker_team_role 
   TABLE DATA           K   COPY public.worker_team_role (id, worker_id, team_id, role_id) FROM stdin;
    public          postgres    false    228   �       [           0    0    access_rights_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.access_rights_id_seq', 5, true);
          public          postgres    false    223            \           0    0    leader_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.leader_id_seq', 1, true);
          public          postgres    false    217            ]           0    0    mark_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.mark_id_seq', 1, true);
          public          postgres    false    233            ^           0    0    meeting_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.meeting_id_seq', 2, true);
          public          postgres    false    229            _           0    0    notification_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.notification_id_seq', 1, false);
          public          postgres    false    231            `           0    0    role_access_rights_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.role_access_rights_id_seq', 7, true);
          public          postgres    false    225            a           0    0    role_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.role_id_seq', 3, true);
          public          postgres    false    221            b           0    0    team_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.team_id_seq', 1, true);
          public          postgres    false    219            c           0    0    worker_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.worker_id_seq', 2, true);
          public          postgres    false    215            d           0    0    worker_team_role_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.worker_team_role_id_seq', 2, true);
          public          postgres    false    227            J   �   x���M�0���)z�`<�[7&�D4��X��^��^a�F��]�i3/�yo,�!xT �w�����@�Va���-ްd��;V
Ŕ�RE��|p^0��Yh�XR.�b��|9�@���	��Ny`�6��2,� N��=ӷO�L��[,�5~�l9c�/�7�;8���C��˘L8��둔���͌      B   Q   x�3��MM-��K�/I-.�7�L��M,�/N�������<��TNs3c#cSKc.#T-Fp-f@��������Є+F��� l� �      D      x�3�4����� ]      F   "   x�3�tI-K��/�M�+QIM��4����� p�Q      P   4   x�3�4202�5��52P04�20 "N���̼TNC.#��)�tZT>F��� �{,      T      x�3�4�4�,����� ��      R      x������ � �      H   ,   x�3��IMLI-�2�J-.��+�L�I�2��/�
��qqq �X
�      L   -   x��9 0��&3��L��
���I٢�0򱶹*���B�      N      x�3�4A.#N# m����� '     