export const lessons = [
  {
    slug: '01-neural-networks',
    number: 1,
    title: '人工神经网络基础',
    english: 'Fundamentals of Artificial Neural Networks',
    shortTitle: '人工神经网络基础',
    topics: ['引言与概览', '多层感知机', '神经网络训练', '案例分析'],
    topicAnchors: ['topic-1', 'topic-31', 'topic-66', 'topic-129'],
    pages: 165,
    hidden: 15,
    summary:
      '从识别芒果的例子开始，理解神经元、网络层、前向传播与反向传播，再讨论优化、正则化和真实案例。',
  },
  {
    slug: '02-cnns',
    number: 2,
    title: '卷积神经网络与图像识别',
    english: 'CNNs and Image Recognition',
    shortTitle: 'CNN 与图像识别',
    topics: ['卷积神经网络', 'CNN 训练', '经典 CNN 架构', '编程练习'],
    topicAnchors: ['topic-1', 'topic-54', 'topic-97', 'topic-119'],
    pages: 120,
    hidden: 1,
    summary:
      '从全连接网络处理图像的局限出发，认识卷积、池化与归一化，逐步推导训练过程，并比较经典网络。',
  },
  {
    slug: '03-rnns-lstms',
    number: 3,
    title: '循环神经网络与长短期记忆',
    english: 'RNNs and LSTMs',
    shortTitle: 'RNN 与 LSTM',
    topics: ['词表示', '循环神经网络', 'LSTM', '序列到序列', 'RNN 补充材料'],
    topicAnchors: ['topic-1', 'topic-38', 'topic-53', 'topic-67', 'topic-137'],
    pages: 158,
    hidden: 22,
    summary:
      '先把词表示成向量，再沿序列建立递归状态，理解长期依赖、门控记忆、机器翻译和注意力。',
  },
  {
    slug: '04-transformers',
    number: 4,
    title: 'Transformer 模型',
    english: 'Transformer Models',
    shortTitle: 'Transformer 模型',
    topics: [
      '自注意力',
      '编码器',
      '解码器',
      '编码器—解码器',
      '模型家族',
      '混合专家',
    ],
    topicAnchors: ['topic-1', 'topic-29', 'topic-38', 'topic-55', 'topic-85', 'topic-115'],
    pages: 184,
    hidden: 0,
    summary:
      '从注意力的计算过程开始，建立 Transformer 的完整结构，再进入 BERT、GPT、ViT、Swin 和混合专家模型。',
  },
  {
    slug: '05-self-supervised',
    number: 5,
    title: '自监督学习',
    english: 'Self-supervised Learning',
    shortTitle: '自监督学习',
    topics: ['动机与评价', '传统代理任务与 MAE', '现代自监督学习'],
    topicAnchors: ['topic-1', 'topic-21', 'topic-75'],
    pages: 112,
    hidden: 0,
    summary:
      '围绕监督信号从何而来，依次学习代理任务、掩码重建、对比学习、自蒸馏及其评估方法。',
  },
  {
    slug: '06-generative',
    number: 6,
    title: '生成模型',
    english: 'Generative Models · Part I & II',
    shortTitle: '生成模型',
    topics: ['概率建模与自回归', '变分自编码器', 'GAN 与扩散模型'],
    topicAnchors: ['gen-learning-tasks', 'gen-autoencoder', 'gen-gan-intro'],
    pages: 193,
    hidden: 0,
    summary:
      '从概率建模、自回归与 VAE 出发，进入 GAN、Rectified Flow、扩散与条件生成，并观察图像、视频和世界模型应用。',
  },
] as const;

export const parallelCourse = {
  href: '/parallel-computing/',
  title: '并行计算与算子编程',
  shortTitle: '并行计算',
  english: 'PARALLEL COMPUTING',
  parts: [
    {
      number: '01',
      title: '理解并行计算',
      summary: '从问题分解出发，建立分析并行性能的直觉。',
      lectures: [
        {
          number: '01',
          title: '并行基础与性能模型',
          slug: 'parallel-01-introduction',
          sourcePath: '01-introduction',
          href: '/lectures/parallel-01-introduction',
        },
        {
          number: '02',
          title: '并行硬件与执行模型',
          slug: 'parallel-02-execution-models',
          sourcePath: '02-execution-models',
          href: '/lectures/parallel-02-execution-models',
        },
      ],
    },
    {
      number: '02',
      title: '走进 CUDA 编程',
      summary: '理解线程与内存，把计算映射到 GPU 上。',
      lectures: [
        {
          number: '03',
          title: 'CUDA编程入门（上）',
          slug: 'parallel-05-cuda-introduction',
          sourcePath: '05-cuda-introduction',
          href: '/lectures/parallel-05-cuda-introduction',
        },
        {
          number: '04',
          title: 'CUDA编程入门（下）',
          slug: 'parallel-06-memory-hierarchy',
          sourcePath: '06-memory-hierarchy',
          href: '/lectures/parallel-06-memory-hierarchy',
        },
      ],
    },
  ],
} as const;

export type Lesson = (typeof lessons)[number];
