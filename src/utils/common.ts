export function subscribeToDeploymentStatus(deploymentId: string, onStatusUpdate: (status: string) => void) {
    const eventSource = new EventSource(`/api/deployments/status?id=${deploymentId}`);
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) {
        onStatusUpdate(data.status);
      }
      if (data.status === 'READY') {
        eventSource.close();
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
  
    return () => {
      eventSource.close();
    };
}