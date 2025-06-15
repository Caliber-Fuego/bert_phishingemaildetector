
type VTResult = {
    threatCategory: string;
    threatFamily: string;
    malicious: number;
    undetected: number;
};

type VirusTotalData = {
    data?: {
        attributes?: {
            last_analysis_stats?: { malicious?: number; undetected?: number };
            popular_threat_classification?: {
                popular_threat_category?: { value?: string }[];
                popular_threat_name?: { value: string }[];
            };
        };
    };
};

export function parseVTResult(data: VirusTotalData): VTResult {
    const attr = data?.data?.attributes;
    const threatClass = attr?.popular_threat_classification;

    if (!attr || !threatClass) {
        return {
            threatCategory: "Unknown",
            threatFamily: "Unknown",
            malicious: NaN,
            undetected: NaN
        };
    }

    const stats = attr.last_analysis_stats || {};
    const threatCategory =
        threatClass.popular_threat_category?.[0]?.value || "Unknown";
    const threatFamilyList = threatClass.popular_threat_name || [];
    const threatFamily = Array.isArray(threatFamilyList)
        ? threatFamilyList.map((f) => f.value).join(", ") || "Unknown"
        : "Unknown";

    return {
        threatCategory,
        threatFamily,
        malicious: stats.malicious ?? NaN,
        undetected: stats.undetected ?? NaN
    };
}
