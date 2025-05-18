interface Document {
  id: string;
  name: string;
  status: 'На подписании' | 'Подписан' | 'Отклонён';
  signedAt?: string;
  rejectedReason?: string;
}

let mockDocumentsDB: Record<string, Document> = {
  '1': { id: '1', name: 'Договор аренды.docx', status: 'На подписании' },
  '2': { id: '2', name: 'Акт выполненных работ.pdf', status: 'На подписании' },
};

const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

export const rejectDocument = async (id: string, reason: string) => {
  await simulateNetworkDelay();

  if (!mockDocumentsDB[id]) {
    throw new Error('Документ не найден');
  }

  mockDocumentsDB[id] = {
    ...mockDocumentsDB[id],
    status: 'Отклонён',
    rejectedReason: reason,
  };

  return mockDocumentsDB[id];
};