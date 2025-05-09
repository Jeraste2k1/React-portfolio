PGDMP  -    -                }            reactportoliobase    17.4    17.4 #    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16386    reactportoliobase    DATABASE     w   CREATE DATABASE reactportoliobase WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'fr-FR';
 !   DROP DATABASE reactportoliobase;
                     postgres    false                        2615    32912    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false            �           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    5            �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        postgres    false    5            �            1259    32932    Category    TABLE     T   CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL
);
    DROP TABLE public."Category";
       public         heap r       postgres    false    5            �            1259    32931    Category_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public."Category_id_seq";
       public               postgres    false    5    221            �           0    0    Category_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;
          public               postgres    false    220            �            1259    32941    File    TABLE     �   CREATE TABLE public."File" (
    id integer NOT NULL,
    filename text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "categoryId" integer NOT NULL
);
    DROP TABLE public."File";
       public         heap r       postgres    false    5            �            1259    32940    File_id_seq    SEQUENCE     �   CREATE SEQUENCE public."File_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."File_id_seq";
       public               postgres    false    5    223            �           0    0    File_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."File_id_seq" OWNED BY public."File".id;
          public               postgres    false    222            �            1259    32923    User    TABLE     �   CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL
);
    DROP TABLE public."User";
       public         heap r       postgres    false    5            �            1259    32922    User_id_seq    SEQUENCE     �   CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."User_id_seq";
       public               postgres    false    219    5            �           0    0    User_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;
          public               postgres    false    218            �            1259    32913    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap r       postgres    false    5            2           2604    32935    Category id    DEFAULT     n   ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);
 <   ALTER TABLE public."Category" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    221    221            3           2604    32944    File id    DEFAULT     f   ALTER TABLE ONLY public."File" ALTER COLUMN id SET DEFAULT nextval('public."File_id_seq"'::regclass);
 8   ALTER TABLE public."File" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222    223            1           2604    32926    User id    DEFAULT     f   ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
 8   ALTER TABLE public."User" ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    219    219            �          0    32932    Category 
   TABLE DATA           .   COPY public."Category" (id, name) FROM stdin;
    public               postgres    false    221   X%       �          0    32941    File 
   TABLE DATA           G   COPY public."File" (id, filename, published, "categoryId") FROM stdin;
    public               postgres    false    223   �%       �          0    32923    User 
   TABLE DATA           ;   COPY public."User" (id, email, password, role) FROM stdin;
    public               postgres    false    219   P&       �          0    32913    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               postgres    false    217   �&       �           0    0    Category_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."Category_id_seq"', 19, true);
          public               postgres    false    220            �           0    0    File_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."File_id_seq"', 32, true);
          public               postgres    false    222            �           0    0    User_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public."User_id_seq"', 1, true);
          public               postgres    false    218            <           2606    32939    Category Category_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Category" DROP CONSTRAINT "Category_pkey";
       public                 postgres    false    221            ?           2606    32949    File File_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."File"
    ADD CONSTRAINT "File_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."File" DROP CONSTRAINT "File_pkey";
       public                 postgres    false    223            9           2606    32930    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public                 postgres    false    219            6           2606    32921 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 postgres    false    217            :           1259    32951    Category_name_key    INDEX     Q   CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);
 '   DROP INDEX public."Category_name_key";
       public                 postgres    false    221            =           1259    33245    File_filename_key    INDEX     Q   CREATE UNIQUE INDEX "File_filename_key" ON public."File" USING btree (filename);
 '   DROP INDEX public."File_filename_key";
       public                 postgres    false    223            7           1259    32950    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public                 postgres    false    219            @           2606    32952    File File_categoryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."File"
    ADD CONSTRAINT "File_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 G   ALTER TABLE ONLY public."File" DROP CONSTRAINT "File_categoryId_fkey";
       public               postgres    false    221    4668    223            �   D   x�3��/*)J�,�2�<��������Լ.μĒҢT.K��Ԕ�̼t.Cδ����<�=... �7�      �   �   x�M�;1�z}�q��-B����������Έ��x:���y|�"Yt�4��5��T���7�L�jȆe< 6H�	I�=֪��|@U6؀\c�n���L����q���H��I��]��دKAѹz��k�����7"���a�      �   b   x�3�LL���sH�M���K���T1JT14P)�Kw/̪*�q�4()���3K+5�,����7ы���uu�����,+*�t	0t�tt�������� ;X      �   �   x�m�[j�@E��U俌�{4^DW0�C(4�串J���{9�-�4�BS�A(d�)��(Qk"	�ƭ��� �Q��5�h��f\z�[��#��4Us��u! ��K��6S���+�^F��y;?���c���|#{�pU�G��G�

��S{^�$+Z�&w+��S��Zw�ԓ1Ma�܆��9�I�{�_
����m��I?��@T���q���~����{�#���$��붮��J_      