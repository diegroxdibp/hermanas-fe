export interface Faq {
  faq: FaqTopic[];
}

export interface FaqTopic {
  topicName: string;
  items: FaqTopicItem[];
}

export interface FaqTopicItem {
  question: string;
  answer: {
    intro?: string;
    steps?: string[];
    outro?: string;
    links?: { label: string; url: string; fragment?: string }[];
  };
}
