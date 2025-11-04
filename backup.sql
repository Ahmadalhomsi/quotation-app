--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Currency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Currency" AS ENUM (
    'TL',
    'USD'
);


ALTER TYPE public."Currency" OWNER TO postgres;

--
-- Name: QuotationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuotationStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."QuotationStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: customer_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_activities (
    id text NOT NULL,
    type text NOT NULL,
    description text,
    result text,
    next_action text,
    customer_id text NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_activities OWNER TO postgres;

--
-- Name: customer_customer_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_customer_types (
    id text NOT NULL,
    customer_id text NOT NULL,
    type_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_customer_types OWNER TO postgres;

--
-- Name: customer_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_types (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6B7280'::text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    category text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_types OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id text NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text,
    phone text,
    address text,
    tax_number text,
    tax_office text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_contact timestamp(3) without time zone,
    next_contact timestamp(3) without time zone,
    notes text,
    priority integer DEFAULT 1 NOT NULL,
    source text
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exchange_rates (
    id text NOT NULL,
    rate numeric(10,4) NOT NULL,
    date date NOT NULL,
    source text DEFAULT 'api'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exchange_rates OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency public."Currency" NOT NULL,
    sku text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    photo_url text,
    purchase_price numeric(10,2)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_items (
    id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    currency public."Currency" NOT NULL,
    discount numeric(5,2) DEFAULT 0,
    quotation_id text NOT NULL,
    product_id text NOT NULL,
    product_name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotation_items OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id text NOT NULL,
    quotation_number text NOT NULL,
    title text NOT NULL,
    description text,
    status public."QuotationStatus" DEFAULT 'DRAFT'::public."QuotationStatus" NOT NULL,
    valid_until timestamp(3) without time zone NOT NULL,
    customer_id text NOT NULL,
    total_tl numeric(10,2),
    total_usd numeric(10,2),
    exchange_rate numeric(10,4),
    kdv_enabled boolean DEFAULT true,
    kdv_rate numeric(5,2) DEFAULT 20,
    terms text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    call_status text DEFAULT 'takip et'::text
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
813560da-2a39-4e0f-8721-e5a6c796872a	287528e3a42acacc5492dd15c3e8819ea4be49b77cab6d74f88c37cbda399af8	2025-09-15 07:53:10.816433+00	20250915075310_init_with_kdv_and_discount	\N	\N	2025-09-15 07:53:10.531752+00	1
07049d84-0148-43aa-ae7e-d93d78679dd2	4c04b2ba8b2151fcecf2941673fc7dd6908a2fd649393fe00406f08c791602d7	2025-09-15 08:16:26.137772+00	20250915081625_make_customer_email_optional	\N	\N	2025-09-15 08:16:25.912554+00	1
988d1463-7a40-4960-a27f-ea2bd7455eff	4a513a8af5c40112689de74bc84ac3a3935e532538f8fd05548a38245d56d64f	2025-09-16 06:43:55.401088+00	20250916064354_add_purchase_price_and_photo_url	\N	\N	2025-09-16 06:43:55.160041+00	1
3adf4587-2eda-4b9e-a548-8b6bd5412988	ca6ff63b1f8a524a84994fb32059ddfee7baffb2590bcef3045675bfc4e78b72	2025-09-18 07:25:22.096475+00	20250918072521_remove_product_type	\N	\N	2025-09-18 07:25:21.859423+00	1
d7c4c8b5-2c7f-4c79-be8e-69d304d8a139	784a75a17bb1a6d93b1edddfcba8beaabc82ce6115f3a6b80c7bec9dd5fac762	2025-09-25 09:02:09.07619+00	20250925090208_add_customer_status_and_marketing_fields	\N	\N	2025-09-25 09:02:08.746635+00	1
37df179e-fd67-4606-8a3f-932b080917df	ccb900461e41b4add52a05be61f0bc6f8244c94ac0b44e8f8ff75e85a3d02f95	2025-09-25 11:28:49.027057+00	20250925112848_add_customizable_customer_status_and_labels	\N	\N	2025-09-25 11:28:48.690384+00	1
072572ba-82c1-47de-a6a0-e8c9182bc13b	b0bb8ccd07e039c5f6d754abdc4d497f26be7c7ece76034da736f7973d87ab29	2025-09-25 12:42:53.177277+00	20250925124252_unify_customer_types	\N	\N	2025-09-25 12:42:52.804477+00	1
5aea72dd-ac6e-4d3b-8677-49da67450246	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-09-25 12:44:50.960965+00	20250925124424_unify_customer_types	\N	\N	2025-09-25 12:44:50.686722+00	1
\.


--
-- Data for Name: customer_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_activities (id, type, description, result, next_action, customer_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: customer_customer_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_customer_types (id, customer_id, type_id, created_at) FROM stdin;
cmg0vsxda0007nz0jppdcgkc2	cmg0vp1ut0000nz0j6wvkzfq0	cmfzeopsa0001mipol2ad2g5k	2025-09-26 13:32:25.199
cmg0vsxda0008nz0jlhhx63m7	cmg0vp1ut0000nz0j6wvkzfq0	cmfzeosfj000cmipof52f0mcq	2025-09-26 13:32:25.199
cmg0vsxda0009nz0j49wcqvpn	cmg0vp1ut0000nz0j6wvkzfq0	cmfzeor050006mipoudt8r0cn	2025-09-26 13:32:25.199
cmg0vsxda000anz0jqe5tfhai	cmg0vp1ut0000nz0j6wvkzfq0	cmfzeorpz0009mipo1aaly30y	2025-09-26 13:32:25.199
cmg7tgt2q0006n30klx6ucui8	cmg7tgt2j0005n30khlmdu0ox	cmfzeopeh0000mipoac0sa7v8	2025-10-01 10:01:23.762
cmg7tgt2q0007n30kukrdc5oi	cmg7tgt2j0005n30khlmdu0ox	cmfzeoso4000dmipoh26lkz79	2025-10-01 10:01:23.762
cmg7tgt2q0008n30khlc7ftms	cmg7tgt2j0005n30khlmdu0ox	cmfzeor050006mipoudt8r0cn	2025-10-01 10:01:23.762
cmg7tgt2q0009n30k5mrrjfh4	cmg7tgt2j0005n30khlmdu0ox	cmfzeoryk000amipo2x7bh7u6	2025-10-01 10:01:23.762
\.


--
-- Data for Name: customer_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_types (id, name, color, description, "isActive", "sortOrder", category, created_at, updated_at) FROM stdin;
cmfzeopeh0000mipoac0sa7v8	Yeni Potansiyel	#10B981	Yeni potansiyel müşteri	t	0	status	2025-09-25 12:45:28.601	2025-09-25 12:45:28.601
cmfzeopsa0001mipol2ad2g5k	Aktif Müşteri	#3B82F6	Aktif olarak çalışılan müşteri	t	0	status	2025-09-25 12:45:29.099	2025-09-25 12:45:29.099
cmfzeoq160002mipo1dx3t3b0	Kaybedilen	#EF4444	Kaybedilen müşteri	t	0	status	2025-09-25 12:45:29.418	2025-09-25 12:45:29.418
cmfzeoq9s0003mipo7prrhlkf	Beklemede	#F59E0B	Beklemede olan müşteri	t	0	status	2025-09-25 12:45:29.728	2025-09-25 12:45:29.728
cmfzeoqid0004mipou64vhxww	Tamamlanan	#6B7280	İş tamamlanan müşteri	t	0	status	2025-09-25 12:45:30.037	2025-09-25 12:45:30.037
cmfzeoqr90005mipoe0f38lur	VIP Müşteri	#DC2626	Yüksek öncelik	t	0	priority	2025-09-25 12:45:30.358	2025-09-25 12:45:30.358
cmfzeor050006mipoudt8r0cn	Önemli	#F59E0B	Orta öncelik	t	0	priority	2025-09-25 12:45:30.678	2025-09-25 12:45:30.678
cmfzeor8t0007miporf2ig97d	Normal	#6B7280	Normal öncelik	t	0	priority	2025-09-25 12:45:30.989	2025-09-25 12:45:30.989
cmfzeorhe0008mipoiann4bbm	Website	#8B5CF6	Website üzerinden gelen	t	0	source	2025-09-25 12:45:31.299	2025-09-25 12:45:31.299
cmfzeorpz0009mipo1aaly30y	Referans	#06B6D4	Referans ile gelen	t	0	source	2025-09-25 12:45:31.607	2025-09-25 12:45:31.607
cmfzeoryk000amipo2x7bh7u6	Reklam	#EC4899	Reklam kampanyası	t	0	source	2025-09-25 12:45:31.917	2025-09-25 12:45:31.917
cmfzeos6y000bmipowjvgbjck	Sosyal Medya	#10B981	Sosyal medya	t	0	source	2025-09-25 12:45:32.218	2025-09-25 12:45:32.218
cmfzeosfj000cmipof52f0mcq	Hızlı Karar	#059669	Hızlı karar veren	t	0	behavior	2025-09-25 12:45:32.528	2025-09-25 12:45:32.528
cmfzeoso4000dmipoh26lkz79	Detaylı İnceleme	#7C3AED	Detaylı inceleme yapan	t	0	behavior	2025-09-25 12:45:32.837	2025-09-25 12:45:32.837
cmfzeoswg000emipoy8ie5zdm	Fiyat Odaklı	#DC2626	Fiyat odaklı müşteri	t	0	behavior	2025-09-25 12:45:33.137	2025-09-25 12:45:33.137
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, company_name, contact_name, email, phone, address, tax_number, tax_office, created_at, updated_at, last_contact, next_contact, notes, priority, source) FROM stdin;
cmfxomas90007qm0jsyx1saw5	10 Numara AVM	Muhammed Bey		+90 531 560 55 89				2025-09-24 07:48:00.152	2025-09-24 07:48:00.152	\N	\N	\N	1	\N
cmfxqjeok000oqm0j09sjj998	Last Dream Coffee	Hüsrev Ertürk	\N	+90 551 107 31 28				2025-09-24 08:41:44.465	2025-09-24 08:41:44.465	\N	\N	\N	1	\N
cmg0vp1ut0000nz0j6wvkzfq0	Un Sanatı	Ömer Elğay	\N	+90 541 247 80 74				2025-09-26 13:29:24.386	2025-09-26 13:32:25.182	2025-09-26 13:29:24.382	\N		2	
cmg2njyx2000bnz0ji69durx1	Fırın Ankara	Emre Özdemir	\N	5323729059				2025-09-27 19:17:02.725	2025-09-27 19:17:02.725	2025-09-27 19:17:02.722	\N	\N	1	\N
cmg50saz6001cnz0jczb7sc3k	Suadiye Marmaris 	Ergün  Öztürkmen	\N	05364966666	Fikirtepe			2025-09-29 11:02:58.961	2025-09-29 11:02:58.961	2025-09-29 11:02:58.958	\N	\N	1	\N
cmg532l7m002dnz0jkm5o83b2	Tozlu Cafe Pizza	Muharrem Bagi	\N	905379599597	Iğdır			2025-09-29 12:06:57.996	2025-09-29 12:06:57.996	2025-09-29 12:06:57.993	\N		2	
cmg7tgt2j0005n30khlmdu0ox	Kapındaki lezzet	Ümit Er	\N	905454646535				2025-10-01 10:01:23.752	2025-10-01 10:01:23.752	2025-10-01 10:01:23.747	\N	demo verildi antalya firması şube sayısı artabilecek tip	2	
cmg7tiwur000an30ki02l3bs4	kebabcı (bilinmiyor)	Bayram Gözükara	\N	905316622871				2025-10-01 10:03:01.971	2025-10-01 10:03:01.971	2025-10-01 10:03:01.969	\N		2	
cmgbzskeu0000o20llbuiahry	Deep Plus Yenibosna	Faik Arslan	\N	\N				2025-10-04 08:09:34.804	2025-10-04 08:09:34.804	2025-10-04 08:09:34.8	\N	\N	1	\N
cmgc1v2e10000ns0kv53pl2nl	Aden Çorba	Yasin Bey	\N	+90 537 998 86 48				2025-10-04 09:07:30.628	2025-10-04 09:07:30.628	2025-10-04 09:07:30.624	\N	\N	1	\N
cmgf5090q000qns0kk83zu5rq	Sarıyer Börek	Devrim Bey	\N	+90 (536) 371 38 02				2025-10-06 12:58:49.871	2025-10-06 12:58:49.871	2025-10-06 12:58:49.867	\N	\N	1	\N
cmgg99rhp000rns0kwwtab008	What The Coffee Yeşilköy	Hasan Fatih Bey	\N	05324420644				2025-10-07 07:45:58.38	2025-10-07 07:45:58.38	2025-10-07 07:45:58.376	\N		2	
cmght0845000yns0kj1k64kq2	Emirhan İşkembe	Engin Kaya 	\N	\N				2025-10-08 09:46:11.859	2025-10-08 09:46:11.859	2025-10-08 09:46:11.857	\N	\N	1	\N
cmghuqrox0027ns0kwvt3fud5	CENNET DÜRÜM	AZİZ BEY	\N	+90 544 588 16 63				2025-10-08 10:34:49.902	2025-10-08 10:34:49.902	2025-10-08 10:34:49.898	\N	\N	1	\N
cmgi7ergv0000nu0131w3mvf1	Smashco	Sami Bey	\N	+90 505 072 35 23				2025-10-08 16:29:24.75	2025-10-08 16:29:24.75	2025-10-08 16:29:24.746	\N	\N	1	\N
cmgj5rwjf0009nu012blc1dyr	KESGİNOĞLU ET & TAVUK	Adem Kesgin	\N	905377063906				2025-10-09 08:31:24.794	2025-10-09 08:31:24.794	2025-10-09 08:31:24.792	\N	\N	1	\N
cmgj74129000hnu01z8amy0zj	PİZZA PROJESİ	DOĞAN BEY	\N	+90 533 323 99 68				2025-10-09 09:08:50.144	2025-10-09 09:08:50.144	2025-10-09 09:08:50.141	\N	\N	1	\N
cmgpbh4800017nu01xmf7ra80	Bakırköy Cafe	Uğur Bey	\N	+90 506 092 45 60	Bakırköy / İstanbul			2025-10-13 15:57:36.286	2025-10-13 15:57:36.286	2025-10-13 15:57:36.283	\N	\N	1	\N
cmgp0ri700010nu014k6nuk80	Yıldız Kafe	Erdal bey 	\N	\N				2025-10-13 10:57:45.179	2025-10-16 08:47:56.284	2025-10-13 10:57:45.177	\N		1	
cmgyy4kr3001lnu010ea0f3z3	Rhino Cafe	Okan Bey	\N	5442139636				2025-10-20 09:41:37.934	2025-10-20 09:41:37.934	2025-10-20 09:41:37.933	\N	\N	1	\N
cmh32mt3l0000pe019rz3r384	Fakı Mehmet 	Bülent YILMAZ	\N	+90 505 483 49 16	İncirli			2025-10-23 06:58:51.724	2025-10-23 06:58:51.724	2025-10-23 06:58:51.719	\N	\N	1	\N
cmh8vyhp7000do901cfm08gew	Gümüş fırım	Özgür bey	\N	\N				2025-10-27 08:38:36.57	2025-10-27 08:38:36.57	2025-10-27 08:38:36.568	\N	\N	1	\N
cmh98t07d000lo901nbeyzq53	Eta Bakery Coffee	Aytekin Bey	\N	+90 532 666 61 70				2025-10-27 14:38:15.625	2025-10-27 14:38:15.625	2025-10-27 14:38:15.623	\N	\N	1	\N
cmh9cjzga003ro9014xt19iqi	Focaccia Metro 	Altan Bey	\N	\N				2025-10-27 16:23:13.208	2025-10-27 16:23:13.208	2025-10-27 16:23:13.204	\N	\N	1	\N
cmhj5e9h30001p5010je4nl7y	Kavurmacii	Ömer Çoşkun	\N	\N				2025-11-03 13:00:30.708	2025-11-03 13:00:30.708	2025-11-03 13:00:30.705	\N	\N	1	\N
cmhkf1kan0008p501xbuefv0f	MARYCO	Said Molaei bey	\N	+90 543 224 06 72	beylikdüzü istanbul			2025-11-04 10:18:20.542	2025-11-04 10:18:20.542	2025-11-04 10:18:20.541	\N	\N	1	\N
cmhkg3j1r000gp501jgqfybkm	BAYPAŞ	HALI SAHA PROJESİ	\N	\N				2025-11-04 10:47:51.854	2025-11-04 10:47:51.854	2025-11-04 10:47:51.852	\N	\N	1	\N
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exchange_rates (id, rate, date, source, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, currency, sku, is_active, created_at, updated_at, photo_url, purchase_price) FROM stdin;
cmfkur89i000atgnwf8vvob95	QR okuyucu	\N	1000.00	TL	\N	t	2025-09-15 08:18:47.529	2025-09-15 08:18:47.529	\N	\N
cmgg9ao3u000sns0kb7ws50ab	Yerinde Kurulum Hizmeti	\N	3000.00	TL	\N	t	2025-10-07 07:46:40.647	2025-10-07 07:46:40.647	\N	\N
cmh9b8jz6000ro901nhl1y6ht	Barkod Okuyucu Kablosuz El Tipi	\N	3000.00	TL	\N	t	2025-10-27 15:46:20.321	2025-10-27 15:46:20.321	\N	\N
cmfxmtzkk0001qm0j2vv0m6t8	MAPOS Barkodlu Satış Yazılımı	Toptan ve Parakende Satış	30000.00	TL	\N	t	2025-09-24 06:57:59.635	2025-09-24 06:57:59.635	\N	\N
cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	Termal Başlık	3000.00	TL	\N	t	2025-09-24 07:45:52.663	2025-09-24 07:45:52.663	\N	\N
cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	Metal Kasa - Metal Kızak	3500.00	TL	\N	t	2025-09-24 07:46:23.816	2025-09-24 07:46:23.816	\N	\N
cmfxoklg20006qm0j5pte5852	Masaüstü Barkod Okuyucu	\N	3500.00	TL	\N	t	2025-09-24 07:46:40.658	2025-09-24 07:46:40.658	\N	\N
cmfxoosmx0008qm0j4vwf2jhm	Mapos Mobil Uygulama	\N	5000.00	TL	\N	t	2025-09-24 07:49:56.6	2025-09-24 07:49:56.6	\N	\N
cmfxoqxws0009qm0jmrojtpt4	Etiket Makinası	Raf Etiketi	4500.00	TL	\N	t	2025-09-24 07:51:36.747	2025-09-24 07:51:36.747	\N	\N
cmg0vpn9s0001nz0j5js0kaon	Ek Kullanıcı Lisansı	\N	5000.00	TL	\N	t	2025-09-26 13:29:52.144	2025-09-26 13:29:52.144	\N	\N
cmg2nofsv000cnz0jajeqxql5	POS PC Dokunmatik Ekran	Possify Marka i7 8.nesil 8gb ddr4 ram 256 msata 18,5 inc. Fansız anakart	30000.00	TL	\N	t	2025-09-27 19:20:31.229	2025-09-27 19:20:31.229	\N	\N
cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	Yıllık Ödemeli	500.00	TL	\N	t	2025-09-27 19:21:56.508	2025-09-27 19:21:56.508	\N	\N
cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	Yıllık Ödemeli	500.00	TL	\N	t	2025-09-27 19:22:18.518	2025-09-27 19:22:18.518	\N	\N
cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	10.1 inc	5000.00	TL	\N	t	2025-09-27 19:23:53.959	2025-09-27 19:23:53.959	\N	\N
cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	Yıllık Ödemeli	2000.00	TL	\N	t	2025-09-29 07:56:29.819	2025-09-29 07:56:29.819	\N	\N
cmg52cwe10020nz0jc81uujxk	Dijital Menu	Yıllık Ödemeli	2000.00	TL	\N	t	2025-09-29 11:46:59.423	2025-09-29 11:46:59.423	\N	\N
cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	İ7 3 nesil 8 gb ram 128 ssd - dahili wifi - dahili hoparlör - dahili bluethooth	21999.99	TL	\N	t	2025-10-08 09:54:29.206	2025-10-08 09:54:29.206	\N	\N
cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	i5 4.nesil fansız anakart (bakım gerektirmez - sessiz çalışır-düşük enerji tüketimi) 8gb ddr3 ram 128 ssd. dahili wifi ve hoparlör.	22000.00	TL	\N	t	2025-09-24 07:45:30.443	2025-09-29 12:05:41.299	\N	\N
cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	\N	6800.00	TL	\N	t	2025-09-29 18:16:58.848	2025-09-29 18:16:58.848	\N	\N
cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	Entegrasyon İçin Gerekli	1300.00	TL	\N	t	2025-09-29 18:17:33.791	2025-09-29 18:17:33.791	\N	\N
cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	Kablolu Entegrasyon. Yıllık Ödemeli.	4800.00	TL	\N	t	2025-09-29 18:20:04.372	2025-09-29 18:20:04.372	\N	\N
cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	\N	2000.00	TL	\N	t	2025-09-29 18:21:37.175	2025-09-29 18:21:37.175	\N	\N
cmgc1xucl0001ns0kv96dtbb6	Cid 2 Hatlı  Arayanı Gösterme Cihazı	Sabit numaranızı arayan telefon numarasını sisteme aktarır	2500.00	TL	\N	t	2025-10-04 09:09:40.195	2025-10-04 09:09:40.195	\N	\N
cmght56mt000zns0khc8gnsvu	POS PC 18,5 inc Dokunmatik i7-6	İ7 6. nesil 8 gb ram 256 ssd - dahili wifi - dahili hoparlör - dahili bluethooth	25000.00	TL	\N	t	2025-10-08 09:50:03.22	2025-10-08 09:54:44.885	\N	\N
cmghtkoxv0011ns0k7qbabq3e	Alt Yapı Kurulumu	Tahmini 100 metre data kablosu - 1 adet elektrik prizi - sarf malzeme   - kablo çekme işçiliği	5000.00	TL	\N	t	2025-10-08 10:02:06.787	2025-10-08 10:02:06.787	\N	\N
cmghtlyk30012ns0k76jm8hxs	8 Port Metal Switch	\N	1000.00	TL	\N	t	2025-10-08 10:03:05.883	2025-10-08 10:03:05.883	\N	\N
cmghtx3cd001kns0k2y67k5uj	Seles Online Terazi	Gramaj Aktatımı Yapar com  Port Üzerinden	8500.00	TL	\N	t	2025-10-08 10:11:45.321	2025-10-08 10:11:45.321	\N	\N
cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	Yıllık Ödemeli	500.00	TL	\N	t	2025-09-27 19:22:36.004	2025-10-08 10:35:57.298	\N	\N
cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	Yıllık Ödemeli	500.00	TL	\N	t	2025-09-27 19:22:50.51	2025-10-08 10:38:38.511	\N	\N
cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	Ömür Boyu Lisans  - Ücretsiz Güncelleme ve 2 Yıl Ücretsiz Destek \r\nMasa Servisi - Gel Al Servisi - Paket Servis	40000.00	TL	\N	t	2025-09-24 06:57:06.781	2025-10-09 09:20:00.015	\N	\N
cmgyy8cnb001mnu01d9ggj40y	Beko X30TR Yazakasa POS	\N	8500.00	TL	\N	t	2025-10-20 09:44:34.052	2025-10-20 09:44:34.052	\N	\N
cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	Ana Yazılım - Yemek Sepeti Entegrasyonu - Getir Yemek Entegrasyonu - Trendyol Entegrasyonu - Migros Yemek Entegrasyonu - Mobil Garson Uygulaması - Mobil Patron Uygulaması - Dijital Menu Uygulaması - Mobil Kurye Uygulaması	11900.00	TL	\N	t	2025-09-24 07:43:24.552	2025-10-20 10:00:03.081	\N	\N
cmh98xyo1000mo901zrfri5f7	Merkez Şube Sipariş Yazılımı	Yıllık Kiralama Olarak Çalışır.	15000.00	TL	\N	t	2025-10-27 14:42:06.887	2025-10-27 14:42:06.887	\N	\N
cmh98zsps000no901e58wji5u	Sanal Pos Entegrrasyonu	Belirlemiş Olduğunuz Bankanızın Sanal POS unu Sipariş Sistemine Entegresi. Tek Sefer Ödenir.	30000.00	TL	\N	t	2025-10-27 14:43:32.51	2025-10-27 14:43:32.51	\N	\N
cmh9asffb000qo901jhsx27ey	E-fatura / E-arşiv / E-irsaliye Entegrasyonu	Satış sonrası e fatura ve sevk irsaliyesi otomatik oluşturma	15000.00	TL	\N	t	2025-10-27 15:33:47.894	2025-10-27 15:33:47.894	\N	\N
cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	Dokunmatik Ekran- wifi - hoparlör - bluetooth	25800.00	TL	\N	t	2025-10-27 15:08:57.811	2025-10-27 15:37:34.641	\N	\N
cmh99uerc000oo901tw9p8440	CAS CL 3000 Borkodlu Terazi	\N	21500.00	TL	\N	t	2025-10-27 15:07:20.722	2025-10-27 15:45:28.404	\N	\N
cmhkgb8ym000hp501c1iwoxqi	Inpos Pinpad	\N	3500.00	TL	\N	t	2025-11-04 10:53:52.001	2025-11-04 10:53:52.001	\N	\N
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_items (id, quantity, unit_price, total_price, currency, discount, quotation_id, product_id, product_name, created_at, updated_at) FROM stdin;
cmgi7gr8n0004nu01c8t9von2	1	11900.00	11900.00	TL	0.00	cmgi7gr8n0002nu011sorddcr	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-08 16:30:57.767	2025-10-08 16:30:57.767
cmgi7gr8n0005nu01wdsbg8vv	1	21000.00	21000.00	TL	0.00	cmgi7gr8n0002nu011sorddcr	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-08 16:30:57.767	2025-10-08 16:30:57.767
cmgi7gr8n0006nu01x21ajjvj	1	1300.00	1300.00	TL	0.00	cmgi7gr8n0002nu011sorddcr	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-08 16:30:57.767	2025-10-08 16:30:57.767
cmgi7gr8n0007nu01upn2u73d	1	4800.00	4800.00	TL	0.00	cmgi7gr8n0002nu011sorddcr	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-08 16:30:57.767	2025-10-08 16:30:57.767
cmgi7gr8n0008nu01uu95hiep	1	6800.00	6800.00	TL	0.00	cmgi7gr8n0002nu011sorddcr	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-08 16:30:57.767	2025-10-08 16:30:57.767
cmgj7iwn3000pnu01qk7wyz9y	1	40000.00	40000.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000qnu018t971ger	1	500.00	500.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000rnu01kr1gp2ih	1	500.00	500.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000snu01yyj1u6hl	1	500.00	500.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000tnu01lp63dj57	1	500.00	500.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000unu010yb6nolj	1	2000.00	2000.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg52cwe10020nz0jc81uujxk	Dijital Menu	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000vnu01t3r2umbg	1	2000.00	2000.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000wnu01xbri9axm	1	22000.00	19800.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000xnu01stgf4fap	1	5000.00	4500.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000ynu01z8b7woy4	2	3000.00	6000.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgj7iwn3000znu01930hhdl2	1	6100.00	6100.00	TL	0.00	cmgj7a685000jnu01ha274g4k	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-09 09:20:24.255	2025-10-09 09:20:24.255
cmgpbqho6001bnu01lmyahioz	1	40000.00	40000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001cnu01slfe68ha	1	22000.00	22000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmg537ktb002hnz0jcf8tmhrz	1	11900.00	11900.00	TL	0.00	cmg537ktb002fnz0jn5v6otuj	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-09-29 12:10:50.783	2025-09-29 12:10:50.783
cmg537ktb002inz0j2lv47qtn	1	22000.00	19800.00	TL	10.00	cmg537ktb002fnz0jn5v6otuj	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-09-29 12:10:50.783	2025-09-29 12:10:50.783
cmg537ktb002jnz0jpma09gn9	1	3000.00	2550.00	TL	15.00	cmg537ktb002fnz0jn5v6otuj	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-09-29 12:10:50.783	2025-09-29 12:10:50.783
cmgpbqho6001dnu01msx1ig83	2	3500.00	7000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001enu01uwv38ug9	1	500.00	500.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001fnu01agpo962b	1	500.00	500.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmfxp2peh000dqm0judlvrc2h	1	30000.00	27000.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxmtzkk0001qm0j2vv0m6t8	MAPOS Barkodlu Satış Yazılımı	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxp2pei000eqm0jjjmvhev0	1	5000.00	4500.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxoosmx0008qm0j4vwf2jhm	Mapos Mobil Uygulama	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxp2pei000fqm0j56lpl9d5	1	22000.00	19800.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxp2pei000gqm0jk6dq6qdo	1	4500.00	4050.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxoqxws0009qm0jmrojtpt4	Etiket Makinası	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxp2pei000hqm0j6dltushj	1	3000.00	2700.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxp2pei000iqm0jf1f67nhq	1	3500.00	3150.00	TL	10.00	cmfxp2peh000bqm0je0g5ei68	cmfxoklg20006qm0j5pte5852	Masaüstü Barkod Okuyucu	2025-09-24 08:00:45.593	2025-09-24 08:00:45.593
cmfxqln0s000sqm0jgpyuyzda	1	11900.00	11900.00	TL	0.00	cmfxqln0s000qqm0jo2xnfui2	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-09-24 08:43:28.588	2025-09-24 08:43:28.588
cmg0vqgsx0005nz0jawkvf4l4	1	22000.00	22000.00	TL	0.00	cmg0vqgsx0003nz0joaubel28	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-09-26 13:30:30.417	2025-09-26 13:30:30.417
cmg0vqgsx0006nz0jqlkaf4vu	1	5000.00	3500.00	TL	30.00	cmg0vqgsx0003nz0joaubel28	cmg0vpn9s0001nz0j5js0kaon	Ek Kullanıcı Lisansı	2025-09-26 13:30:30.417	2025-09-26 13:30:30.417
cmg4ukitx0012nz0j01iza83f	1	30000.00	30000.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nofsv000cnz0jajeqxql5	POS PC Dokunmatik Ekran	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0013nz0jxya5tzza	1	5000.00	5000.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0014nz0j4m2818fx	2	22000.00	44000.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0015nz0jasg66t62	1	40000.00	40000.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0016nz0jlim4zwzu	1	500.00	500.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0017nz0jj8uk6gfw	1	500.00	500.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0018nz0j0mia0ym9	1	500.00	500.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx0019nz0jii0eia0m	1	500.00	500.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx001anz0jmtonfrot	1	2500.00	2500.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmfkur89i000atgnwf8vvob95	QR okuyucu	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmg4ukitx001bnz0jdnu985ov	1	2000.00	2000.00	TL	0.00	cmg2nw1f8000jnz0jwfuqw29r	cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	2025-09-29 08:08:58.197	2025-09-29 08:08:58.197
cmgj5v3yz000dnu01eh97ci0c	1	30000.00	30000.00	TL	0.00	cmgj5v3yy000bnu01505mh6de	cmfxmtzkk0001qm0j2vv0m6t8	MAPOS Barkodlu Satış Yazılımı	2025-10-09 08:33:54.394	2025-10-09 08:33:54.394
cmgj5v3yz000enu01dykki33u	1	500.00	500.00	TL	0.00	cmgj5v3yy000bnu01505mh6de	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-09 08:33:54.394	2025-10-09 08:33:54.394
cmgj5v3yz000fnu01ptenz0ko	1	500.00	500.00	TL	0.00	cmgj5v3yy000bnu01505mh6de	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-10-09 08:33:54.394	2025-10-09 08:33:54.394
cmgj5v3yz000gnu0180gz8oem	1	3500.00	3500.00	TL	0.00	cmgj5v3yy000bnu01505mh6de	cmfxoklg20006qm0j5pte5852	Masaüstü Barkod Okuyucu	2025-10-09 08:33:54.394	2025-10-09 08:33:54.394
cmgp0tsgn0014nu0151ruv24u	1	11900.00	11900.00	TL	0.00	cmgp0tsgm0012nu01oa58hc7n	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-13 10:59:31.798	2025-10-13 10:59:31.798
cmg5gp4sm0032nz0j33pqumd1	1	40000.00	32000.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0033nz0jvroevpu4	1	22000.00	20900.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0034nz0jn0hejkwx	1	3000.00	2850.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0035nz0ji9gshj9p	1	3500.00	3500.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0036nz0jpbsjuoxc	1	500.00	250.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0037nz0jemguxo5k	1	500.00	250.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0038nz0jt1zrt41e	1	500.00	250.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm0039nz0j6rn5ewk3	1	500.00	250.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003anz0jo8abhtk3	1	2000.00	1000.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003bnz0j2gx5dnj2	1	2000.00	1000.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg52cwe10020nz0jc81uujxk	Dijital Menu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003cnz0jn7k84ys7	1	6800.00	6800.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003dnz0jrpbmvqmv	1	1300.00	1300.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003enz0jjt3p1ges	1	2000.00	2000.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmg5gp4sm003fnz0j26sh8pwk	1	4800.00	4800.00	TL	0.00	cmg52ef0c0022nz0j9kbxnl75	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-09-29 18:28:24.838	2025-09-29 18:28:24.838
cmgc0yxpj0003rw0kl1zga7ya	1	22000.00	22000.00	TL	0.00	cmgc0yxpj0001rw0kve2hx6x5	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-10-04 08:42:31.573	2025-10-04 08:42:31.573
cmgc0yxpj0004rw0kqq21dpxj	1	11900.00	11900.00	TL	0.00	cmgc0yxpj0001rw0kve2hx6x5	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-04 08:42:31.573	2025-10-04 08:42:31.573
cmgc0yxpj0005rw0k7r7656gf	1	4800.00	4800.00	TL	0.00	cmgc0yxpj0001rw0kve2hx6x5	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-04 08:42:31.573	2025-10-04 08:42:31.573
cmgc0yxpj0006rw0k9kvfdz9c	1	1300.00	1300.00	TL	0.00	cmgc0yxpj0001rw0kve2hx6x5	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-04 08:42:31.573	2025-10-04 08:42:31.573
cmgc0yxpj0007rw0kpgbhnlqf	1	6800.00	6800.00	TL	0.00	cmgc0yxpj0001rw0kve2hx6x5	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-04 08:42:31.573	2025-10-04 08:42:31.573
cmgc27ja1000lns0k2d3opj8w	1	40000.00	35200.00	TL	0.00	cmgc21oh50003ns0krkjdu6fv	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-04 09:17:12.41	2025-10-04 09:17:12.41
cmgc27ja1000mns0krr3f22fh	1	500.00	500.00	TL	0.00	cmgc21oh50003ns0krkjdu6fv	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-04 09:17:12.41	2025-10-04 09:17:12.41
cmgc27ja1000nns0kukh2tezz	1	2000.00	2000.00	TL	0.00	cmgc21oh50003ns0krkjdu6fv	cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	2025-10-04 09:17:12.41	2025-10-04 09:17:12.41
cmgc27ja1000ons0ksgaif5zr	1	3000.00	3000.00	TL	0.00	cmgc21oh50003ns0krkjdu6fv	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-04 09:17:12.41	2025-10-04 09:17:12.41
cmgc27ja1000pns0ka7i9nflo	1	2500.00	2500.00	TL	0.00	cmgc21oh50003ns0krkjdu6fv	cmgc1xucl0001ns0kv96dtbb6	Cid 2 Hatlı  Arayanı Gösterme Cihazı	2025-10-04 09:17:12.41	2025-10-04 09:17:12.41
cmgg9b0jm000wns0k6qezfzcl	1	11900.00	11900.00	TL	0.00	cmgg9b0jm000uns0kro2rkwfz	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-07 07:46:56.77	2025-10-07 07:46:56.77
cmgg9b0jm000xns0kjr0oso90	1	3000.00	3000.00	TL	0.00	cmgg9b0jm000uns0kro2rkwfz	cmgg9ao3u000sns0kb7ws50ab	Yerinde Kurulum Hizmeti	2025-10-07 07:46:56.77	2025-10-07 07:46:56.77
cmghtrrb40016ns0k42ovukka	1	40000.00	40000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb40017ns0kezm8pksl	1	2000.00	2000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb40018ns0kjsym99bn	1	2000.00	2000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg52cwe10020nz0jc81uujxk	Dijital Menu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb40019ns0kh7yo2ihb	1	500.00	500.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001ans0k5gfzc9v8	1	500.00	500.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001bns0kcmzjkcf0	1	500.00	500.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001cns0ktyuntfcl	1	25000.00	25000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmght56mt000zns0khc8gnsvu	POS PC 18,5 inc Dokunmatik i7-6	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001dns0kta7kl7lg	2	22000.00	44000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001ens0kyjml7c8x	3	3000.00	9000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001fns0k2bna1tb2	1	6800.00	6800.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001gns0ke4e1ae6y	1	1300.00	1300.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001hns0k49zldu44	1	4800.00	4800.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001ins0km5jree7j	1	5000.00	5000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmghtkoxv0011ns0k7qbabq3e	Alt Yapı Kurulumu	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmghtrrb4001jns0kcd5jlyvx	1	1000.00	1000.00	TL	0.00	cmghtrrb40014ns0k77o7xbmv	cmghtlyk30012ns0k76jm8hxs	8 Port Metal Switch	2025-10-08 10:07:36.448	2025-10-08 10:07:36.448
cmgp0tsgn0015nu01xwdq8vvr	1	22000.00	19800.00	TL	10.00	cmgp0tsgm0012nu01oa58hc7n	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-13 10:59:31.798	2025-10-13 10:59:31.798
cmgp0tsgn0016nu01vhejpud9	1	3000.00	2400.00	TL	20.00	cmgp0tsgm0012nu01oa58hc7n	cmgg9ao3u000sns0kb7ws50ab	Yerinde Kurulum Hizmeti	2025-10-13 10:59:31.798	2025-10-13 10:59:31.798
cmgpbqho6001gnu01ruu4aqfh	1	500.00	500.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001hnu018lsurem4	1	500.00	500.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001inu01hus7qouf	1	2000.00	2000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg52cwe10020nz0jc81uujxk	Dijital Menu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho6001jnu01emsohm1o	1	2000.00	2000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg4u4hdo0011nz0jsdvay04v	MAPOS Patron Uygulaması	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmgpbqho7001knu017qy6x40n	1	2000.00	2000.00	TL	0.00	cmgpbqho50019nu0128j6gsd6	cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	2025-10-13 16:04:53.62	2025-10-13 16:04:53.62
cmghu7u31001zns0k4xn11pig	1	11900.00	11900.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310020ns0k86l3xyhq	1	25000.00	25000.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmght56mt000zns0khc8gnsvu	POS PC 18,5 inc Dokunmatik i7-6	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310021ns0kltto87o0	1	3000.00	2970.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310022ns0kuwdlb312	1	3500.00	3465.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310023ns0k082jief5	1	8500.00	8500.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmghtx3cd001kns0k2y67k5uj	Seles Online Terazi	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310024ns0kvlq8t7zh	1	6800.00	6800.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310025ns0kwjftjmgd	1	1300.00	1300.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghu7u310026ns0k8g76sd2h	1	4800.00	4800.00	TL	0.00	cmghu2jsv001mns0kgzmtldo8	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-08 10:20:06.541	2025-10-08 10:20:06.541
cmghuuqt6002bns0kb6i97q9a	1	40000.00	40000.00	TL	0.00	cmghuuqt60029ns0kilv1xpjz	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt6002cns0kicc5enex	1	500.00	0.00	TL	100.00	cmghuuqt60029ns0kilv1xpjz	cmg2nr42s000fnz0jpzmoxcte	Trendyol Yemek Entegrasyonu	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt6002dns0kaqt4v8fy	1	500.00	0.00	TL	100.00	cmghuuqt60029ns0kilv1xpjz	cmg2nq9ml000dnz0jf3w1y5qr	Yemek Sepeti Entegrasyonu	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt6002ens0klq7fk0pj	1	500.00	0.00	TL	100.00	cmghuuqt60029ns0kilv1xpjz	cmg2nqql4000enz0jkttphs6n	Getir Yemek Entegrasyonu	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt6002fns0kgr8ttyn9	1	500.00	0.00	TL	100.00	cmghuuqt60029ns0kilv1xpjz	cmg2nrf9q000gnz0jt153muey	Migros Yemek Entegrasyonu	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt6002gns0khytzn4vi	1	6800.00	6800.00	TL	0.00	cmghuuqt60029ns0kilv1xpjz	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt7002hns0kzcyzhc4c	1	1300.00	1300.00	TL	0.00	cmghuuqt60029ns0kilv1xpjz	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmghuuqt7002ins0khjimlntj	1	4800.00	4800.00	TL	0.00	cmghuuqt60029ns0kilv1xpjz	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-08 10:37:55.385	2025-10-08 10:37:55.385
cmgyyf2c1001qnu0135fotytv	1	11900.00	11900.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001rnu01t4yxvcq9	1	25000.00	25000.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmght56mt000zns0khc8gnsvu	POS PC 18,5 inc Dokunmatik i7-6	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001snu01od3hs37r	1	21000.00	21000.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001tnu012m1wwu44	2	2000.00	4000.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001unu01juqc6ja2	2	6800.00	13600.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001vnu016smg6yik	1	1300.00	1300.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001wnu01x3yd9chn	1	4800.00	4800.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmgyyf2c1001xnu01syaofo6g	1	2000.00	2000.00	TL	0.00	cmgyyf2c1001onu011mbq9flj	cmg5gge9n002nnz0j7x83fkpz	Mapos Yazakasa Pos Entegrasyonu	2025-10-20 09:49:47.28	2025-10-20 09:49:47.28
cmh9bxrm4002vo901o5tupjiu	1	20000.00	15000.00	TL	25.00	cmh9bxrm3002to9013yfbuxre	cmh98xyo1000mo901zrfri5f7	Merkez Şube Sipariş Yazılımı	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm4002wo9012azhdj9u	1	35000.00	29750.00	TL	15.00	cmh9bxrm3002to9013yfbuxre	cmfxmtzkk0001qm0j2vv0m6t8	MAPOS Barkodlu Satış Yazılımı	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm4002xo90131mn7kms	1	15000.00	14250.00	TL	5.00	cmh9bxrm3002to9013yfbuxre	cmh9asffb000qo901jhsx27ey	E-fatura / E-arşiv / E-irsaliye Entegrasyonu	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm4002yo9011pa30mji	1	15000.00	14250.00	TL	5.00	cmh9bxrm3002to9013yfbuxre	cmh98zsps000no901e58wji5u	Sanal Pos Entegrrasyonu	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm4002zo901u04tz0yg	1	25800.00	25026.00	TL	3.00	cmh9bxrm3002to9013yfbuxre	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm50030o901u8qnsy2e	1	21500.00	20855.00	TL	3.00	cmh9bxrm3002to9013yfbuxre	cmh99uerc000oo901tw9p8440	CAS CL 3000 Borkodlu Terazi	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm50031o901xdfgwu4m	1	3000.00	2910.00	TL	3.00	cmh9bxrm3002to9013yfbuxre	cmh9b8jz6000ro901nhl1y6ht	Barkod Okuyucu Kablosuz El Tipi	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh9bxrm50032o901cug47wgo	1	3000.00	2910.00	TL	3.00	cmh9bxrm3002to9013yfbuxre	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-27 16:05:56.618	2025-10-27 16:05:56.618
cmh3izmi30009pe019tw3b1eo	1	30000.00	22500.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000ape019ta2eejf	1	22000.00	22000.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000bpe0122kr8q5t	1	5000.00	5000.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000cpe01wa8yx98c	1	3000.00	3000.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000dpe01gynk7t4t	1	8500.00	8500.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmghtx3cd001kns0k2y67k5uj	Seles Online Terazi	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000epe01l69w7k9e	1	3000.00	3000.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmfxoklg20006qm0j5pte5852	Masaüstü Barkod Okuyucu	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh3izmi3000fpe01ydv4cq4r	1	3500.00	3500.00	TL	0.00	cmh32toy30002pe01jdjnfoax	cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	2025-10-23 14:36:43.563	2025-10-23 14:36:43.563
cmh9c9tbh0036o901o6vregms	1	40000.00	20000.00	TL	50.00	cmh9c9tbh0034o901j16jjphe	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh0037o901en7g79et	2	25800.00	49020.00	TL	5.00	cmh9c9tbh0034o901j16jjphe	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh0038o901y0uif3fp	1	5000.00	4750.00	TL	5.00	cmh9c9tbh0034o901j16jjphe	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh0039o901zpwqb37t	1	8500.00	8075.00	TL	5.00	cmh9c9tbh0034o901j16jjphe	cmghtx3cd001kns0k2y67k5uj	Seles Online Terazi	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh003ao901dhcgg4kt	2	3000.00	5700.00	TL	5.00	cmh9c9tbh0034o901j16jjphe	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh003bo9017dg3tt8p	2	6800.00	13600.00	TL	0.00	cmh9c9tbh0034o901j16jjphe	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh003co901q8p806tl	1	4800.00	4800.00	TL	0.00	cmh9c9tbh0034o901j16jjphe	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh003do901ger5l739	1	1300.00	1300.00	TL	0.00	cmh9c9tbh0034o901j16jjphe	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9c9tbh003eo90136u5ulpv	1	3500.00	3325.00	TL	5.00	cmh9c9tbh0034o901j16jjphe	cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	2025-10-27 16:15:18.701	2025-10-27 16:15:18.701
cmh9ikjru000cqa01aluvxvor	1	40000.00	30000.00	TL	25.00	cmh9cmy3p003to901zhg3wikc	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmh9ikjru000dqa01i9r0q7pa	2	25800.00	50052.00	TL	3.00	cmh9cmy3p003to901zhg3wikc	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmh9ikjru000eqa018nplfz9o	2	5000.00	9800.00	TL	2.00	cmh9cmy3p003to901zhg3wikc	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmh9ikjru000fqa018sjz2veg	2	6800.00	13600.00	TL	0.00	cmh9cmy3p003to901zhg3wikc	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmh9ikjru000gqa01l86vz236	2	1300.00	2600.00	TL	0.00	cmh9cmy3p003to901zhg3wikc	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmh9ikjru000hqa01hkvs6hye	2	4800.00	9600.00	TL	0.00	cmh9cmy3p003to901zhg3wikc	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-27 19:11:37.242	2025-10-27 19:11:37.242
cmhkge169000lp50108hdc2g3	1	40000.00	40000.00	TL	0.00	cmhkge169000jp501qxfegcqp	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-11-04 10:56:01.905	2025-11-04 10:56:01.905
cmhkge169000mp501y3of7dbl	1	22000.00	22000.00	TL	0.00	cmhkge169000jp501qxfegcqp	cmfxoj39o0003qm0jqkznppz4	POS PC Dokunmatik Ekran	2025-11-04 10:56:01.905	2025-11-04 10:56:01.905
cmhkge169000np501dj1fnmne	1	3000.00	3000.00	TL	0.00	cmhkge169000jp501qxfegcqp	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-11-04 10:56:01.905	2025-11-04 10:56:01.905
cmhkge169000op501qg6dya4i	1	3500.00	3500.00	TL	0.00	cmhkge169000jp501qxfegcqp	cmhkgb8ym000hp501c1iwoxqi	Inpos Pinpad	2025-11-04 10:56:01.905	2025-11-04 10:56:01.905
cmh9cfltu003io901ejcr7kft	1	40000.00	20000.00	TL	50.00	cmh9cfltt003go901g7l6hcj5	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltu003jo901mn99bhlb	3	25800.00	73530.00	TL	5.00	cmh9cfltt003go901g7l6hcj5	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltu003ko901t76nz64d	1	5000.00	4750.00	TL	5.00	cmh9cfltt003go901g7l6hcj5	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003lo901n60jzlae	1	8500.00	8075.00	TL	5.00	cmh9cfltt003go901g7l6hcj5	cmghtx3cd001kns0k2y67k5uj	Seles Online Terazi	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003mo901etzy2z5o	6	3000.00	17100.00	TL	5.00	cmh9cfltt003go901g7l6hcj5	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003no9010p7s7grd	3	6800.00	20400.00	TL	0.00	cmh9cfltt003go901g7l6hcj5	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003oo901r6gvlqmj	1	4800.00	4800.00	TL	0.00	cmh9cfltt003go901g7l6hcj5	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003po901xybj7u6b	1	1300.00	1300.00	TL	0.00	cmh9cfltt003go901g7l6hcj5	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh9cfltv003qo901pvryyy5j	1	3500.00	3325.00	TL	5.00	cmh9cfltt003go901g7l6hcj5	cmfxok8ga0005qm0jas3pw494	Para Çekmecesi	2025-10-27 16:19:48.929	2025-10-27 16:19:48.929
cmh8w19mz000ho901bip8lm96	1	21999.99	19799.99	TL	10.00	cmh8w19mz000fo901e8bhdq3i	cmghtavvc0010ns0kjrtrpjv8	POS PC 18,5 inc Dokunmatik i7-3	2025-10-27 08:40:46.091	2025-10-27 08:40:46.091
cmh8w19mz000io9010s68plw3	1	3000.00	3000.00	TL	0.00	cmh8w19mz000fo901e8bhdq3i	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-10-27 08:40:46.091	2025-10-27 08:40:46.091
cmh8w19mz000jo901m6yrupjs	1	5500.00	5500.00	TL	0.00	cmh8w19mz000fo901e8bhdq3i	cmfxoqxws0009qm0jmrojtpt4	Etiket Makinası	2025-10-27 08:40:46.091	2025-10-27 08:40:46.091
cmh8w19mz000ko901o3uvwgok	1	35000.00	35000.00	TL	0.00	cmh8w19mz000fo901e8bhdq3i	cmfxmtzkk0001qm0j2vv0m6t8	MAPOS Barkodlu Satış Yazılımı	2025-10-27 08:40:46.091	2025-10-27 08:40:46.091
cmhj5fqjn0005p5016uqzkm76	1	40000.00	40000.00	TL	0.00	cmhj5fqjn0003p501czvgb0c0	cmfxmsusf0000qm0j8jeir4nn	MAPOS Adisyon Sistemi	2025-11-03 13:01:39.491	2025-11-03 13:01:39.491
cmhj5fqjn0006p5019jrm012n	1	25800.00	25800.00	TL	0.00	cmhj5fqjn0003p501czvgb0c0	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-11-03 13:01:39.491	2025-11-03 13:01:39.491
cmhj5fqjo0007p501w27srtkz	2	3000.00	6000.00	TL	0.00	cmhj5fqjn0003p501czvgb0c0	cmfxojkex0004qm0j3f643sx4	Fiş Yazıcı	2025-11-03 13:01:39.491	2025-11-03 13:01:39.491
cmh9ih7x20006qa01hv063945	1	11900.00	10115.00	TL	15.00	cmh9cq6a20042o901hajurwwa	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmh9ih7x20007qa01f3ha85jk	2	25800.00	50052.00	TL	3.00	cmh9cq6a20042o901hajurwwa	cmh99whn8000po901mknw9eyk	POS PC Stork 18.5” i7-5th Gen 8/128	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmh9ih7x20008qa01p6z21ium	2	5000.00	9800.00	TL	2.00	cmh9cq6a20042o901hajurwwa	cmg2nss89000hnz0j68xvo27b	Müşteri Ekranı	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmh9ih7x20009qa01j0n0jgtl	2	6800.00	13600.00	TL	0.00	cmh9cq6a20042o901hajurwwa	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmh9ih7x2000aqa017dem9m5p	2	1300.00	2600.00	TL	0.00	cmh9cq6a20042o901hajurwwa	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmh9ih7x2000bqa01exlljnvi	2	4800.00	9600.00	TL	0.00	cmh9cq6a20042o901hajurwwa	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-10-27 19:09:01.909	2025-10-27 19:09:01.909
cmhkf2dt9000cp5013o68eg44	1	11900.00	11900.00	TL	0.00	cmhkf2dt9000ap501l4i3ug0d	cmfxoge580002qm0jjfsn83ut	MAPOS Yıllık Kiralama - Full Paket	2025-11-04 10:18:58.797	2025-11-04 10:18:58.797
cmhkf2dt9000dp501u9s3j63c	1	6800.00	6800.00	TL	0.00	cmhkf2dt9000ap501l4i3ug0d	cmg5gafhd002knz0j2pnak1ii	İnpos m530 Yazarkasa POS	2025-11-04 10:18:58.797	2025-11-04 10:18:58.797
cmhkf2dta000ep501rskqakal	1	1300.00	1300.00	TL	0.00	cmhkf2dt9000ap501l4i3ug0d	cmg5gb6g3002lnz0jvwurl8f6	İnpos Ekü	2025-11-04 10:18:58.797	2025-11-04 10:18:58.797
cmhkf2dta000fp50103mke2mx	1	4800.00	4800.00	TL	0.00	cmhkf2dt9000ap501l4i3ug0d	cmg5geemw002mnz0janjjavks	İnpos GMP3 Entegrasyonu	2025-11-04 10:18:58.797	2025-11-04 10:18:58.797
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, quotation_number, title, description, status, valid_until, customer_id, total_tl, total_usd, exchange_rate, kdv_enabled, kdv_rate, terms, notes, created_at, updated_at, call_status) FROM stdin;
cmfxp2peh000bqm0je0g5ei68	TKL-2025-001	Teklif	434885	ACCEPTED	2025-10-24 07:48:26.407	cmfxomas90007qm0jsyx1saw5	61200.00	0.00	41.4300	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50’si peşinat olarak alınır.\nKalan %50’lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-09-24 08:00:45.593	2025-09-24 08:44:02.251	takip et
cmg2nw1f8000jnz0jwfuqw29r	TKL-2025-005	Teklif		ACCEPTED	2025-10-27 19:15:38.397	cmg2njyx2000bnz0ji69durx1	125500.00	3017.55	41.5900	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-09-27 19:26:25.845	2025-10-04 08:08:16.157	takip et
cmgc21oh50003ns0krkjdu6fv	TKL-2025-011	Teklif		ACCEPTED	2025-11-03 08:59:04.864	cmgc1v2e10000ns0kv53pl2nl	43200.00	1036.22	41.6900	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-04 09:12:39.21	2025-10-06 12:49:47.431	takip et
cmfxqln0s000qqm0jo2xnfui2	TKL-2025-002	Teklif		ACCEPTED	2025-10-24 08:40:41.29	cmfxqjeok000oqm0j09sjj998	11900.00	0.00	41.4300	f	20.00	Lisanslama işlemi ödeme sonrası yapılır.		2025-09-24 08:43:28.588	2025-09-29 14:23:24.667	takip et
cmg537ktb002fnz0jn5v6otuj	TKL-2025-009	Pos Sistemi Teklifi	Pizzacı Yazılımı	SENT	2025-10-29 12:09:00.663	cmg532l7m002dnz0jkm5o83b2	34250.00	0.00	41.5900	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-09-29 12:10:50.783	2025-09-29 18:15:45.822	takip et
cmghu2jsv001mns0kgzmtldo8	TKL-2025-014	Teklif		ACCEPTED	2025-11-07 10:08:13.882	cmgf5090q000qns0kk83zu5rq	64735.00	1551.28	41.7300	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-08 10:15:59.935	2025-10-16 08:41:51.782	takip et
cmg52ef0c0022nz0j9kbxnl75	TKL-2025-008	Teklif		SENT	2025-10-29 11:34:08.407	cmg50saz6001cnz0jczb7sc3k	77150.00	1855.01	41.5900	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-09-29 11:48:10.236	2025-09-29 18:28:24.815	takip et
cmg0vqgsx0003nz0joaubel28	TKL-2025-004	Teklif		ACCEPTED	2025-10-26 13:27:58.638	cmg0vp1ut0000nz0j6wvkzfq0	25500.00	0.00	41.5400	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-09-26 13:30:30.417	2025-10-06 12:52:22.879	takip et
cmghuuqt60029ns0kilv1xpjz	TKL-2025-015	Teklif		ACCEPTED	2025-11-07 10:34:11.698	cmghuqrox0027ns0kwvt3fud5	52900.00	0.00	41.7300	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-08 10:37:55.385	2025-10-08 14:32:23.275	takip et
cmgg9b0jm000uns0kro2rkwfz	TKL-2025-012	Teklif		REJECTED	2025-11-06 07:46:02.331	cmgg99rhp000rns0kwwtab008	14900.00	0.00	41.7000	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-07 07:46:56.77	2025-10-15 07:29:14.358	takip et
cmgc0yxpj0001rw0kve2hx6x5	TKL-2025-010	Teklif		ACCEPTED	2025-11-03 08:39:05.605	cmgbzskeu0000o20llbuiahry	46800.00	0.00	41.6900	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-04 08:42:31.573	2025-10-08 16:28:18.526	takip et
cmghtrrb40014ns0k77o7xbmv	TKL-2025-013	Teklif		REJECTED	2025-11-07 09:54:49.657	cmght0845000yns0kj1k64kq2	142400.00	0.00	41.7300	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-08 10:07:36.448	2025-10-15 07:29:09.831	takip et
cmgi7gr8n0002nu011sorddcr	TKL-2025-016	Teklif		ACCEPTED	2025-11-07 16:28:34.664	cmgi7ergv0000nu0131w3mvf1	45800.00	0.00	41.7300	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-08 16:30:57.767	2025-10-23 14:42:57.236	takip et
cmgp0tsgm0012nu01oa58hc7n	TKL-2025-019	Teklif		ACCEPTED	2025-11-12 10:57:19.667	cmgp0ri700010nu014k6nuk80	34100.00	0.00	41.8200	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-13 10:59:31.798	2025-10-16 08:47:03.805	arandı
cmgpbqho50019nu0128j6gsd6	TKL-2025-020	Teklif		SENT	2025-11-12 15:56:49.156	cmgpbh4800017nu01xmf7ra80	77000.00	0.00	41.8200	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-13 16:04:53.62	2025-10-16 14:57:27.448	1 daha ara
cmgj5v3yy000bnu01505mh6de	TKL-2025-017	Teklif		REJECTED	2025-11-08 08:30:58.768	cmgj5rwjf0009nu012blc1dyr	34500.00	0.00	41.7500	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-09 08:33:54.394	2025-10-16 08:44:57.351	arandı
cmgyyf2c1001onu011mbq9flj	TKL-2025-021	Teklif		ACCEPTED	2025-11-19 09:40:53.885	cmgyy4kr3001lnu010ea0f3z3	83600.00	0.00	41.9600	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-20 09:49:47.28	2025-10-23 14:42:46.4	takip et
cmgj7a685000jnu01ha274g4k	TKL-2025-018	Teklif		SENT	2025-11-08 09:08:04.628	cmgj74129000hnu01z8amy0zj	82400.00	1973.65	41.7500	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-09 09:13:36.773	2025-10-16 14:57:31.61	1 daha ara
cmh8w19mz000fo901e8bhdq3i	TKL-2025-024	Teklif		SENT	2025-11-26 08:38:18.776	cmh8vyhp7000do901cfm08gew	63299.99	0.00	42.0200	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 08:40:46.091	2025-10-27 15:59:17.334	takip et
cmh9c9tbh0034o901j16jjphe	TKL-2025-026	Güneşli Şube	Şube Satış Otomasyonu. Adisyon Yazılımına %50 şube iskontosu yapılmıştır.	SENT	2025-11-26 16:07:51.128	cmh98t07d000lo901nbeyzq53	132684.00	0.00	42.0200	t	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 16:15:18.701	2025-10-27 16:29:14.946	takip et
cmh9bxrm3002to9013yfbuxre	TKL-2025-025	İmalat Yazılımı Fiyat Teklifi	Şubeden merkeze sipariş geçme ve ödemesini yapma, şubede üretim emri oluşturma ve sevk etme işlemi yapma, sevk ile beraber\nfatura ve irsaliye süreçlerini yönetme ile ilgili sürecin fiyat teklifid	SENT	2025-11-26 16:03:20.325	cmh98t07d000lo901nbeyzq53	149941.20	0.00	42.0200	t	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 16:05:56.618	2025-10-27 16:29:17.688	takip et
cmh32toy30002pe01jdjnfoax	TKL-2025-023	Teklif		ACCEPTED	2025-11-22 06:57:11.274	cmh32mt3l0000pe019rz3r384	67500.00	1607.14	42.0000	t	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-23 07:04:12.938	2025-11-03 15:37:13.674	takip et
cmh9cfltt003go901g7l6hcj5	TKL-2025-027	Arena Park 2 Şube	Şube Satış Otomasyonu. Adisyon Yazılımına %50 şube iskontosu yapılmıştır.\n	SENT	2025-11-26 16:16:42.151	cmh98t07d000lo901nbeyzq53	183936.00	0.00	42.0200	t	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 16:19:48.929	2025-10-27 16:29:13.253	takip et
cmh9cq6a20042o901hajurwwa	TKL-2025-029	Teklif	Kiralık Yazılım Modeli	SENT	2025-11-26 16:25:51.063	cmh9cjzga003ro9014xt19iqi	95767.00	2279.08	42.0200	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 16:28:01.994	2025-10-27 19:09:01.88	takip et
cmh9cmy3p003to901zhg3wikc	TKL-2025-028	Teklif		SENT	2025-11-26 16:22:29.612	cmh9cjzga003ro9014xt19iqi	115652.00	2752.31	42.0200	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-10-27 16:25:31.429	2025-10-27 19:11:37.208	takip et
cmhj5fqjn0003p501czvgb0c0	TKL-2025-030	Teklif		ACCEPTED	2025-12-03 13:00:09.221	cmhj5e9h30001p5010je4nl7y	71800.00	0.00	42.0700	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-11-03 13:01:39.491	2025-11-03 15:37:04.623	takip et
cmhkf2dt9000ap501l4i3ug0d	TKL-2025-031	Teklif		DRAFT	2025-12-04 10:17:06.863	cmhkf1kan0008p501xbuefv0f	24800.00	0.00	42.0700	f	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-11-04 10:18:58.797	2025-11-04 10:18:58.797	takip et
cmhkge169000jp501qxfegcqp	TKL-2025-032	Teklif		DRAFT	2025-12-04 10:47:35.45	cmhkg3j1r000gp501jgqfybkm	82200.00	0.00	42.0700	t	20.00	-Geçerlilik Süresi\nTeklif kabul edildikten sonra geçerlilik süresi 15 gündür.\n\n-Ödeme Koşulları\nİşe başlanması için toplam bedelin %50'si peşinat olarak alınır.\nKalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.\n\n-Garanti Şartları\nTeslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.\nKullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.		2025-11-04 10:56:01.905	2025-11-04 10:56:01.905	takip et
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: customer_activities customer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_pkey PRIMARY KEY (id);


--
-- Name: customer_customer_types customer_customer_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_customer_types
    ADD CONSTRAINT customer_customer_types_pkey PRIMARY KEY (id);


--
-- Name: customer_types customer_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_types
    ADD CONSTRAINT customer_types_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: customer_customer_types_customer_id_type_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customer_customer_types_customer_id_type_id_key ON public.customer_customer_types USING btree (customer_id, type_id);


--
-- Name: customer_types_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customer_types_name_key ON public.customer_types USING btree (name);


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: exchange_rates_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX exchange_rates_date_key ON public.exchange_rates USING btree (date);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: quotations_quotation_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX quotations_quotation_number_key ON public.quotations USING btree (quotation_number);


--
-- Name: customer_activities customer_activities_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_customer_types customer_customer_types_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_customer_types
    ADD CONSTRAINT customer_customer_types_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_customer_types customer_customer_types_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_customer_types
    ADD CONSTRAINT customer_customer_types_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.customer_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotation_items quotation_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotation_items quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

