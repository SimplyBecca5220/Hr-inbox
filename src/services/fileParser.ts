import type { RawCandidateMessage } from '../types';

export interface FileParseResult {
  success: boolean;
  data?: RawCandidateMessage[];
  fileName: string;
  error?: string;
  skippedCount?: number;
}

export class FileParserService {
  /**
   * Reads and parses a user-uploaded JSON file in the browser using FileReader.
   * Validates schema, extracts candidate fields with flexible key mappings,
   * and auto-generates fallback identifiers and metadata.
   */
  public static parseCandidateJsonFile(file: File): Promise<FileParseResult> {
    return new Promise((resolve) => {
      // Validate file extension / mime type
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        return resolve({
          success: false,
          fileName: file.name,
          error: 'Invalid file format. Please upload a file with a .json extension.',
        });
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const content = event.target?.result;
          if (typeof content !== 'string' || !content.trim()) {
            return resolve({
              success: false,
              fileName: file.name,
              error: 'The uploaded JSON file is empty.',
            });
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(content);
          } catch {
            return resolve({
              success: false,
              fileName: file.name,
              error: 'Invalid JSON syntax. Please verify that your file is formatted correctly.',
            });
          }

          // Extract array from either top-level array or nested common root keys
          let rawList: unknown[] = [];
          if (Array.isArray(parsed)) {
            rawList = parsed;
          } else if (parsed && typeof parsed === 'object') {
            const obj = parsed as Record<string, unknown>;
            if (Array.isArray(obj.messages)) {
              rawList = obj.messages;
            } else if (Array.isArray(obj.candidates)) {
              rawList = obj.candidates;
            } else if (Array.isArray(obj.data)) {
              rawList = obj.data;
            } else if (Array.isArray(obj.inbox)) {
              rawList = obj.inbox;
            } else {
              return resolve({
                success: false,
                fileName: file.name,
                error: 'Expected a JSON array of candidate messages or an object containing a "messages" or "candidates" array.',
              });
            }
          } else {
            return resolve({
              success: false,
              fileName: file.name,
              error: 'Expected a JSON array of candidate messages.',
            });
          }

          if (rawList.length === 0) {
            return resolve({
              success: false,
              fileName: file.name,
              error: 'The uploaded file does not contain any candidate records.',
            });
          }

          const validMessages: RawCandidateMessage[] = [];
          let skipped = 0;

          rawList.forEach((item) => {
            if (!item || typeof item !== 'object') {
              skipped++;
              return;
            }

            const rec = item as Record<string, unknown>;

            // 1. Flexible Name extraction
            const rawName =
              rec.name ??
              rec.sender_name ??
              rec.candidate_name ??
              rec.sender ??
              rec.from_name ??
              rec.author;
            const sender_name = typeof rawName === 'string' ? rawName.trim() : '';

            // 2. Flexible Email extraction
            const rawEmail =
              rec.email ??
              rec.sender_email ??
              rec.candidate_email ??
              rec.from_email ??
              rec.from ??
              rec.contact;
            const sender_email = typeof rawEmail === 'string' ? rawEmail.trim() : '';

            // 3. Flexible Body extraction
            const rawBody =
              rec.body ??
              rec.original_message ??
              rec.message ??
              rec.text ??
              rec.candidate_message ??
              rec.content ??
              rec.email_body;
            const body = typeof rawBody === 'string' ? rawBody.trim() : '';

            // Must contain at minimum: name, email, and body
            if (!sender_name || !sender_email || !body) {
              skipped++;
              return;
            }

            // Auto-generate fallback ID if missing
            const rawId = rec.id ?? rec.message_id ?? rec._id;
            const id =
              typeof rawId === 'string' || typeof rawId === 'number'
                ? String(rawId).trim()
                : `custom-msg-${validMessages.length + 1}`;

            // Optional metadata with clean fallbacks
            const rawSubject = rec.subject ?? rec.title ?? rec.email_subject;
            const subject =
              typeof rawSubject === 'string' && rawSubject.trim()
                ? rawSubject.trim()
                : 'Candidate Inquiry';

            const rawRole =
              rec.applied_role ?? rec.role ?? rec.position ?? rec.job_title ?? rec.job;
            const applied_role =
              typeof rawRole === 'string' && rawRole.trim() ? rawRole.trim() : 'Applicant';

            const rawStage = rec.stage ?? rec.pipeline_stage ?? rec.status;
            const stage =
              typeof rawStage === 'string' && rawStage.trim() ? rawStage.trim() : 'In Review';

            const rawDate =
              rec.date_received ?? rec.date ?? rec.received_at ?? rec.timestamp;
            const date_received =
              typeof rawDate === 'string' && rawDate.trim()
                ? rawDate.trim()
                : new Date().toISOString();

            validMessages.push({
              id,
              sender_name,
              sender_email,
              date_received,
              subject,
              applied_role,
              stage,
              body,
            });
          });

          if (validMessages.length === 0) {
            return resolve({
              success: false,
              fileName: file.name,
              error: `Validation error: None of the entries contained the required fields (name, email, and message body). ${skipped} entries skipped.`,
            });
          }

          return resolve({
            success: true,
            fileName: file.name,
            data: validMessages,
            skippedCount: skipped,
          });
        } catch (err) {
          return resolve({
            success: false,
            fileName: file.name,
            error: `An unexpected error occurred while processing the file: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          fileName: file.name,
          error: 'FileReader encountered an error reading the file.',
        });
      };

      reader.readAsText(file);
    });
  }
}
