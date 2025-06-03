type VTStats = {
    malicious: number;
    undetected: number;
};

type VTThreatName = {
    value: string;
    count: number;
};

type VTResult = {
    threatCategory: string;
    threatFamily: string;
    malicious: number;
    undetected: number;
};

export function parseVTResult(data: {
    data: {
        attributes: {
            last_analysis_stats: VTStats;
            popular_threat_classification: {
                popular_threat_category?: VTThreatName[];
                popular_threat_name?: VTThreatName[];
            };
        };
    };
}): VTResult {
    const stats = data.data.attributes.last_analysis_stats;
    const threatCategory =
        data.data.attributes.popular_threat_classification.popular_threat_category?.[0]?.value || "Unknown";
    const threatFamilyList = data.data.attributes.popular_threat_classification.popular_threat_name || [];
    const threatFamily = threatFamilyList.map((f: VTThreatName) => f.value).join(", ") || "Unknown";

    return {
        threatCategory,
        threatFamily,
        malicious: stats.malicious,
        undetected: stats.undetected
    };
}
