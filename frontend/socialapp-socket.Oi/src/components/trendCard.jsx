import React from 'react';
import { 
    Card, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    IconButton, 
    Button, 
    Box,
    useTheme
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

// بيانات وهمية للترندات
const mockTrends = [
    {
        category: "Promoted by",
        title: "المملكة تترأس (الانتوساي)",
        subtitle: "أكبر منظمة دولية في المراجعة",
        type: "Promotion",
        promotedBy: "الديوان العام للمحاسبة",
        posts: null
    },
    {
        category: "Politics",
        title: "Erika",
        type: "Trending",
        subtitle: "77.7K posts",
        posts: 77700
    },
    {
        category: "Sports",
        title: "Gakpo",
        type: "Trending",
        subtitle: "7,070 posts",
        posts: 7070
    },
    {
        category: "Trending in Saudi Arabia",
        title: "#النصر_الفيحاء",
        type: "Hashtag",
        subtitle: "129K posts",
        posts: 129000
    },
];

/**
 * يمثل بطاقة "What's happening" (الترندات) في الشريط الجانبي.
 * يتبع تصميم MUI والوضع الداكن لتطبيق X.
 */
const TrendsCard = () => {
    const theme = useTheme();

    // تصميم مخصص لليستة (List)
    const trendItemStyle = {
        // اجعل الخلفية شفافة
        backgroundColor: 'transparent', 
        '&:hover': {
            backgroundColor: theme.palette.action.hover, // تظليل خفيف عند التحويم
            cursor: 'pointer'
        },
        padding: '0px',
        margin: '0px'
    };
    
    // تصميم مخصص لرأس البطاقة
    const cardHeaderStyle = {
        padding: '12px 16px',
        fontWeight: 'bold',
        fontSize: '20px',
        color: theme.palette.text.primary,
    };
    
    // تصميم الجسم الداخلي للبطاقة
    const cardContentStyle = {
        padding: '0px !important',
    };

    return (
        <Card
            sx={{
                borderRadius: '16px',
                // لون خلفية مميز للقسم الجانبي
                backgroundColor: theme.palette.mode === 'dark' ? '#16181C' : '#F7F9F9',
                boxShadow: 'none',
                mt: 2, // هامش علوي للفصل عن المكونات الأخرى
                width: '100%',
                overflow: 'hidden' // لإخفاء أي شيء يتجاوز الحواف الدائرية
            }}
        >
            {/* عنوان البطاقة: What's happening */}
            <Typography variant="h6" sx={cardHeaderStyle}>
                What's happening
            </Typography>

            <Box sx={cardContentStyle}>
                <List disablePadding>
                    {mockTrends.map((trend, index) => (
                        <ListItem
                            key={index}
                            sx={trendItemStyle}
                            alignItems="flex-start"
                            secondaryAction={
                                // زر الثلاث نقاط (More Options)
                                <IconButton edge="end" aria-label="options" size="small">
                                    <MoreHorizIcon sx={{ color: theme.palette.text.secondary }} />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                sx={{ 
                                    padding: '12px 16px', 
                                    margin: 0,
                                    // يضمن أن النص لا يختفي تحت زر More
                                    pr: '48px' 
                                }}
                                primary={
                                    <Box>
                                        {/* التصنيف/نوع الترند */}
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary" 
                                            display="block"
                                            sx={{ lineHeight: 1.2 }}
                                        >
                                            {trend.type === "Promotion" ? 'Promoted by ' + trend.promotedBy : trend.category + ' · ' + trend.type}
                                            {trend.type === "Promotion" && (
                                                <ArrowOutwardIcon sx={{ fontSize: '0.8em', verticalAlign: 'middle', ml: 0.5 }} />
                                            )}
                                        </Typography>

                                        {/* عنوان الترند (بالخط العريض) */}
                                        <Typography
                                            variant="body1"
                                            component="span"
                                            sx={{ fontWeight: 'bold', color: theme.palette.text.primary, lineHeight: 1.3 }}
                                        >
                                            {trend.title}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    // عدد المنشورات أو الوصف
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{ lineHeight: 1.2 }}
                                    >
                                        {trend.subtitle}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                    
                    {/* زر Show more */}
                    <ListItem sx={{ padding: '0px' }}>
                        <Button 
                            fullWidth 
                            sx={{ 
                                justifyContent: 'flex-start',
                                padding: '16px', 
                                textTransform: 'none', 
                                color: theme.palette.primary.main,
                                borderRadius: '0 0 16px 16px', // حواف دائرية في الأسفل فقط
                                '&:hover': { backgroundColor: theme.palette.action.hover }
                            }}
                        >
                            Show more
                        </Button>
                    </ListItem>
                </List>
            </Box>
        </Card>
    );
};

export default TrendsCard;