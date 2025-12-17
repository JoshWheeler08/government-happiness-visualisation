

// Map csv keys to full names for estimates
function mapWBKeys(key) {
    if (key === "voice_and_accountability") {
        return "Voice and Accountability";
    } else if (key === "political_stability") {
        return "Political Stability";
    } else if (key === "government_effectiveness") {
        return "Government Effectiveness";
    } else if (key === "regulator_quality") {
        return "Regulator Quality";
    } else if (key === "rule_of_law") {
        return "Rule Of Law";
    } else if (key === "control_of_corruption") {
        return "Control of Corruption";
    }
    return null;
}

function mapWBLabelToAttr(label, data) {
    if (label === "Voice and Accountability") {
        return data.voice_and_accountability;
    } else if (label === "Political Stability") {
        return data.political_stability;
    } else if (label === "Government Effectiveness") {
        return data.government_effectiveness;
    } else if (label === "Regulator Quality") {
        return data.regulator_quality;
    } else if (label === "Rule Of Law") {
        return data.rule_of_law;
    } else if (label === "Control of Corruption") {
        return data.control_of_corruption;
    }
}

// Map key names to user friendly names
function mapHKeys(key) {
    if (key === "life_ladder") {
        return "Life Ladder";
    } else if (key === "log_gdp") {
        return "Log GDP per capita";
    } else if (key === "health_life") {
        return "Healthy life expectancy at birth";
    } else if (key === "freedom") {
        return "Freedom to make life choices";
    }
    return null;
}

function mapHLabelToAttr(label, data) {
    if (label === "Life Ladder") {
        return data.life_ladder;
    } else if (label === "Log GDP per capita") {
        return data.log_gdp;
    } else if (label === "Healthy life expectancy at birth") {
        return data.health_life;
    } else if (label === "Freedom to make life choices") {
        return data.freedom;
    }
}
