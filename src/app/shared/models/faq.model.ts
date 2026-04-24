export interface Faq {
  faq: FaqTopic[];
}

export interface FaqTopic {
  topicName: string;
  items: FaqTopicItem[];
}


export interface FaqTopicItem {
  question: string;
  answer: string;
}