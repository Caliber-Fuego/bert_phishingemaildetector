export type AttachmentResult = {
    name: string;
    threatCategory: string;
    threatFamily: string;
    malicious: number;
    undetected: number;
};

export type ScanLog = {
    timestamp: number;
    emailText: string;
    result: string;
    confidence: string;
    topTokens: { token: string; shap_value: number }[];
    attachments?: AttachmentResult[];
};