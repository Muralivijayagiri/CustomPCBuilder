export interface Message {
  role: 'user' | 'model';
  content: string;
}

export async function streamChat(
  message: string,
  history: Message[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      onError(errorText);
      return;
    }

    if (!res.body) {
      onError('No response body');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onToken(chunk);
      }
    }

    onDone();
  } catch (error: any) {
    onError(error.message || 'Stream failed');
  }
}
