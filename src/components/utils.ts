export function formatTime(time: number): string {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  
  export async function downloadTranscript(transcript: string, filename: string) {
    if (transcript && filename) {
      try {
        if (typeof window.showSaveFilePicker === 'function') {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${filename.replace(/\.[^/.]+$/, "")}_transcript.txt`,
            types: [{
              description: 'Text Files',
              accept: {'text/plain': ['.txt']},
            }],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(transcript);
          await writable.close();
        } else {
          const element = document.createElement("a");
          const file = new Blob([transcript], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${filename.replace(/\.[^/.]+$/, "")}_transcript.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
        console.log('Transcript downloaded successfully.');
      } catch (error) {
        console.error('Error downloading transcript:', error);
      }
    }
  }
  
  