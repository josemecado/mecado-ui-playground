// GeometryBrowser/GeometryCard.tsx - Add error handling and debugging

import React, {useState} from "react";
import styled from "styled-components";

export interface GeometryFile {
    id: string;
    filename: string;
    title: string;
    thumbnailUrl?: string; // Optional: will use placeholder if not provided
    fileSize?: string;
    dateModified?: Date;
    fileType: "stp" | "step" | "vtp" | "vtk" | "stl";
    filePath?: string; // Full path to the STP file
    tags?: string[];
    description?: string;

    // VTP visualization files
    vtpFiles?: {
        bodies?: string; // Path to bodies.vtp
        edges?: string; // Path to edges.vtp
        faces?: string; // Path to faces.vtp
        json?: string; // Path to JSON metadata file
    };
}

interface GeometryCardProps {
    geometry: GeometryFile;
    onClick: () => void;
}

export const GeometryCard: React.FC<GeometryCardProps> = ({
                                                              geometry,
                                                              onClick,
                                                          }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const formatDate = (date: Date) => {
        try {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "Unknown date";
        }
    };

    const handleImageError = () => {
        console.error(
            `Failed to load thumbnail for ${geometry.id}:`,
            geometry.thumbnailUrl
        );
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log(
            `Successfully loaded thumbnail for ${geometry.id}:`,
            geometry.thumbnailUrl
        );
        setImageLoaded(true);
    };

    // Fallbacks for missing data
    const title = geometry.title || geometry.filename || "Untitled";
    const filename = geometry.filename || "unknown.stp";
    const fileType = geometry.fileType?.toUpperCase() || "STP";
    const category = geometry.tags?.[0] || "uncategorized";

    // Debug log
    console.log(`GeometryCard ${geometry.id}:`, {
        hasThumbnail: !!geometry.thumbnailUrl,
        thumbnailUrl: geometry.thumbnailUrl,
        imageError,
        imageLoaded,
    });

    return (
        <CardContainer onClick={onClick}>
            <ThumbnailContainer>
                {geometry.thumbnailUrl && !imageError ? (
                    <ThumbnailImage
                        src={geometry.thumbnailUrl}
                        alt={title}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                ) : (
                    <PlaceholderIcon>
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                            <path d="M8 13h8"/>
                            <path d="M8 17h8"/>
                        </svg>
                        <PlaceholderText>{fileType}</PlaceholderText>
                    </PlaceholderIcon>
                )}
            </ThumbnailContainer>

            <CardContent>
                <TitleSection>
                    <CardTitle title={title}>{title}</CardTitle>
                    <CardFilename title={filename}>{filename}</CardFilename>
                </TitleSection>

                <CardFooter>
                    <CardMeta>
                        {geometry.fileSize && (
                            <Tag $color="#f45"> {geometry.fileSize}</Tag>
                        )
                        }
                        {geometry.dateModified && (
                            <Tag>{formatDate(geometry.dateModified)}</Tag>
                        )}
                        {!geometry.fileSize && !geometry.dateModified && (
                            <MetaItem>STEP file</MetaItem>
                        )}
                    </CardMeta>
                    <TagsContainer>
                        <Tag>{category}</Tag>
                    </TagsContainer>
                </CardFooter>
            </CardContent>
        </CardContainer>
    );
};

// ============================================================================
// Styled Components
// ============================================================================

const CardContainer = styled.div`
    display: flex;
    width: 100%;
    min-height: ${({theme}) => theme.components.card.heightMedium};
    background-color: ${({theme}) => theme.colors.backgroundSecondary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.components.card.radius};
    overflow: hidden;
    cursor: pointer;
    transition: all ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};

    &:hover {
        border-color: ${({theme}) => theme.colors.brandPrimary};
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ThumbnailContainer = styled.div`
    display: flex;
    flex: 1;
    background: red;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    gap: ${({theme}) => theme.spacing[2]};
`;

const ThumbnailImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const PlaceholderIcon = styled.div`
    color: ${({theme}) => theme.colors.accentPrimary};
    opacity: 0.5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${({theme}) => theme.spacing[2]};
`;

const PlaceholderText = styled.div`
    font-size: ${({theme}) => theme.typography.size.lg};
    font-weight: ${({theme}) => theme.typography.weight.bold};
    color: ${({theme}) => theme.colors.accentPrimary};
    opacity: 0.6;
    letter-spacing: 0.1em;
`;

const CardContent = styled.div`
    padding: ${({theme}) => theme.spacing[3]};
    display: flex;
    flex: 2;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
    background: ${({theme}) => theme.colors.backgroundSecondary};
`;

const CardTitle = styled.h3`
    font-size: ${({theme}) => theme.typography.size.md};
    font-weight: ${({theme}) => theme.typography.weight.bold};
    color: ${({theme}) => theme.colors.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CardFilename = styled.div`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textMuted};
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${({theme}) => theme.spacing[2]};
    margin-top: auto;
    padding-top: ${({theme}) => theme.spacing[2]};
`;

const CardMeta = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing[2]};
    flex-wrap: wrap;
`;

const MetaItem = styled.span`
    font-size: 0.75rem;
    color: ${({theme}) => theme.colors.textMuted};
    line-height: 1.4;

    &:not(:last-child)::after {
        content: "•";
        margin-left: ${({theme}) => theme.spacing[2]};
        opacity: 0.5;
    }
`;

const TagsContainer = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing[1]};
`;

const Tag = styled.span<{ $color?: string }>`
    font-size: 0.7rem;
    padding: ${({theme}) => theme.spacing[1]} ${({theme}) => theme.spacing[2]};
    background-color: ${props => props.color};;
    color: ${({theme}) => theme.colors.textPrimary};
    border-radius: ${({theme}) => theme.radius.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    line-height: 1.4;
    text-transform: capitalize;
`;

// Headers
const TitleSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.primitives.spacing[0.5]};
`;