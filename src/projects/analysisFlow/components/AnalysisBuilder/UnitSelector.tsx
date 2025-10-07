// analysisFlow/components/AnalysisBuilder/UnitSelector.tsx
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";

interface UnitOption {
  base: string;
  display: string;
  prefixes: Array<{ symbol: string; multiplier: number; display: string }>;
}

const UNIT_OPTIONS: Record<string, UnitOption[]> = {
  "Length": [
    { 
      base: "m", 
      display: "meter",
      prefixes: [
        { symbol: "km", multiplier: 1000, display: "kilometer" },
        { symbol: "m", multiplier: 1, display: "meter" },
        { symbol: "cm", multiplier: 0.01, display: "centimeter" },
        { symbol: "mm", multiplier: 0.001, display: "millimeter" },
        { symbol: "μm", multiplier: 0.000001, display: "micrometer" },
        { symbol: "nm", multiplier: 0.000000001, display: "nanometer" },
      ]
    },
    { 
      base: "in", 
      display: "inch",
      prefixes: [
        { symbol: "ft", multiplier: 12, display: "foot" },
        { symbol: "in", multiplier: 1, display: "inch" },
      ]
    },
  ],
  "Temperature": [
    { 
      base: "°C", 
      display: "Celsius",
      prefixes: [
        { symbol: "°C", multiplier: 1, display: "Celsius" },
      ]
    },
    { 
      base: "°F", 
      display: "Fahrenheit",
      prefixes: [
        { symbol: "°F", multiplier: 1, display: "Fahrenheit" },
      ]
    },
    { 
      base: "K", 
      display: "Kelvin",
      prefixes: [
        { symbol: "K", multiplier: 1, display: "Kelvin" },
      ]
    },
  ],
  "Pressure/Stress": [
    { 
      base: "Pa", 
      display: "Pascal",
      prefixes: [
        { symbol: "GPa", multiplier: 1e9, display: "Gigapascal" },
        { symbol: "MPa", multiplier: 1e6, display: "Megapascal" },
        { symbol: "kPa", multiplier: 1e3, display: "Kilopascal" },
        { symbol: "Pa", multiplier: 1, display: "Pascal" },
      ]
    },
    { 
      base: "psi", 
      display: "PSI",
      prefixes: [
        { symbol: "ksi", multiplier: 1000, display: "Kilopound per square inch" },
        { symbol: "psi", multiplier: 1, display: "Pound per square inch" },
      ]
    },
  ],
  "Force": [
    { 
      base: "N", 
      display: "Newton",
      prefixes: [
        { symbol: "kN", multiplier: 1000, display: "Kilonewton" },
        { symbol: "N", multiplier: 1, display: "Newton" },
        { symbol: "mN", multiplier: 0.001, display: "Millinewton" },
      ]
    },
    { 
      base: "lbf", 
      display: "Pound-force",
      prefixes: [
        { symbol: "lbf", multiplier: 1, display: "Pound-force" },
      ]
    },
  ],
  "Mass": [
    { 
      base: "kg", 
      display: "kilogram",
      prefixes: [
        { symbol: "kg", multiplier: 1, display: "kilogram" },
        { symbol: "g", multiplier: 0.001, display: "gram" },
        { symbol: "mg", multiplier: 0.000001, display: "milligram" },
      ]
    },
    { 
      base: "lb", 
      display: "pound",
      prefixes: [
        { symbol: "lb", multiplier: 1, display: "pound" },
        { symbol: "oz", multiplier: 0.0625, display: "ounce" },
      ]
    },
  ],
  "Frequency": [
    { 
      base: "Hz", 
      display: "Hertz",
      prefixes: [
        { symbol: "GHz", multiplier: 1e9, display: "Gigahertz" },
        { symbol: "MHz", multiplier: 1e6, display: "Megahertz" },
        { symbol: "kHz", multiplier: 1e3, display: "Kilohertz" },
        { symbol: "Hz", multiplier: 1, display: "Hertz" },
      ]
    },
  ],
  "Time": [
    { 
      base: "s", 
      display: "second",
      prefixes: [
        { symbol: "h", multiplier: 3600, display: "hour" },
        { symbol: "min", multiplier: 60, display: "minute" },
        { symbol: "s", multiplier: 1, display: "second" },
        { symbol: "ms", multiplier: 0.001, display: "millisecond" },
        { symbol: "μs", multiplier: 0.000001, display: "microsecond" },
      ]
    },
  ],
  "Power": [
    { 
      base: "W", 
      display: "Watt",
      prefixes: [
        { symbol: "MW", multiplier: 1e6, display: "Megawatt" },
        { symbol: "kW", multiplier: 1e3, display: "Kilowatt" },
        { symbol: "W", multiplier: 1, display: "Watt" },
        { symbol: "mW", multiplier: 0.001, display: "Milliwatt" },
      ]
    },
  ],
  "Dimensionless": [
    { 
      base: "", 
      display: "No unit",
      prefixes: [
        { symbol: "", multiplier: 1, display: "Dimensionless" },
        { symbol: "%", multiplier: 0.01, display: "Percent" },
      ]
    },
  ],
};

interface UnitSelectorProps {
  value: string;
  onChange: (unit: string) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState<UnitOption | null>(null);

  // Find current unit in the options
  const currentUnit = useMemo(() => {
    for (const [category, units] of Object.entries(UNIT_OPTIONS)) {
      for (const unit of units) {
        const prefix = unit.prefixes.find(p => p.symbol === value);
        if (prefix) {
          return { category, unit, prefix };
        }
      }
    }
    return null;
  }, [value]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedBase(null);
  };

  const handleBaseSelect = (unit: UnitOption) => {
    setSelectedBase(unit);
  };

  const handlePrefixSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    setSelectedCategory(null);
    setSelectedBase(null);
  };

  const increaseMagnitude = () => {
    if (!currentUnit) return;
    const prefixes = currentUnit.unit.prefixes;
    const currentIndex = prefixes.findIndex(p => p.symbol === value);
    if (currentIndex > 0) {
      onChange(prefixes[currentIndex - 1].symbol);
    }
  };

  const decreaseMagnitude = () => {
    if (!currentUnit) return;
    const prefixes = currentUnit.unit.prefixes;
    const currentIndex = prefixes.findIndex(p => p.symbol === value);
    if (currentIndex < prefixes.length - 1) {
      onChange(prefixes[currentIndex + 1].symbol);
    }
  };

  const canIncrease = currentUnit && currentUnit.unit.prefixes.findIndex(p => p.symbol === value) > 0;
  const canDecrease = currentUnit && currentUnit.unit.prefixes.findIndex(p => p.symbol === value) < currentUnit.unit.prefixes.length - 1;

  return (
    <Container>
      <CurrentUnitDisplay onClick={() => setIsOpen(!isOpen)}>
        <UnitText>{value || "Select unit"}</UnitText>
        <ChevronDown size={14} />
      </CurrentUnitDisplay>

      {value && currentUnit && (
        <MagnitudeControls>
          <MagnitudeButton 
            onClick={increaseMagnitude}
            disabled={!canIncrease}
            title="Increase magnitude"
          >
            <ChevronUp size={12} />
          </MagnitudeButton>
          <MagnitudeButton 
            onClick={decreaseMagnitude}
            disabled={!canDecrease}
            title="Decrease magnitude"
          >
            <ChevronDown size={12} />
          </MagnitudeButton>
        </MagnitudeControls>
      )}

      {isOpen && (
        <Dropdown>
          {!selectedCategory ? (
            <CategoryList>
              {Object.keys(UNIT_OPTIONS).map((category) => (
                <CategoryItem
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </CategoryItem>
              ))}
            </CategoryList>
          ) : !selectedBase ? (
            <>
              <BackButton onClick={() => setSelectedCategory(null)}>
                ← Back to categories
              </BackButton>
              <BaseList>
                {UNIT_OPTIONS[selectedCategory].map((unit) => (
                  <BaseItem
                    key={unit.base}
                    onClick={() => handleBaseSelect(unit)}
                  >
                    {unit.display}
                  </BaseItem>
                ))}
              </BaseList>
            </>
          ) : (
            <>
              <BackButton onClick={() => setSelectedBase(null)}>
                ← Back to {selectedCategory}
              </BackButton>
              <PrefixList>
                {selectedBase.prefixes.map((prefix) => (
                  <PrefixItem
                    key={prefix.symbol}
                    onClick={() => handlePrefixSelect(prefix.symbol)}
                    $selected={prefix.symbol === value}
                  >
                    <PrefixSymbol>{prefix.symbol || "—"}</PrefixSymbol>
                    <PrefixDisplay>{prefix.display}</PrefixDisplay>
                  </PrefixItem>
                ))}
              </PrefixList>
            </>
          )}
        </Dropdown>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  position: relative;
  display: flex;
  gap: 4px;
`;

const CurrentUnitDisplay = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--border-outline);
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const UnitText = styled.span`
  font-size: 13px;
  color: var(--text-primary);
`;

const MagnitudeControls = styled.div`
  display: flex;
  gap: 2px;
`;

const MagnitudeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  border-radius: 3px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--accent-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
`;

const CategoryList = styled.div`
  padding: 4px;
`;

const CategoryItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--accent-primary);
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: none;
  border-bottom: 1px solid var(--border-outline);
  color: var(--accent-primary);
  font-size: 11px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const BaseList = styled.div`
  padding: 4px;
`;

const BaseItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

const PrefixList = styled.div`
  padding: 4px;
`;

const PrefixItem = styled.div<{ $selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.$selected ? "var(--accent-primary)" : "transparent"};
  border: 1px solid ${props => props.$selected ? "var(--accent-primary)" : "transparent"};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px;

  &:hover {
    background: ${props => props.$selected ? "rgba(var(--accent-primary-rgb), 0.15)" : "var(--bg-tertiary)"};
  }
`;

const PrefixSymbol = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: "Monaco", "Courier New", monospace;
`;

const PrefixDisplay = styled.span`
  font-size: 10px;
  color: var(--text-muted);
`;