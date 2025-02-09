pdf(NULL) # prevent create Rplots.pdf
par(family = "serif")

tests <- c()
levels <- c()
colors <- c()
labels <- c()

axis_at <- c()

exit <- function() { invokeRestart("abort") } 

remove_outliers <- function(x, na.rm = TRUE, ...) {
    qnt <- quantile(x, probs=c(.3, .75), na.rm = na.rm, ...)
    H <- 1.5 * IQR(x, na.rm = na.rm)
    y <- x
    y[x < (qnt[1] - H)] <- NA
    y[x > (qnt[2] + H)] <- NA
    y
}

create_boxplot <- function(time, x, ...) {
    boxplot(x, ...,
        main = NULL,
        ylab = paste("Tempo (", time, ")", sep = ""), xaxt="n",
        col = c(colors, "")
    )
    axis(side = 1, at = axis_at, 
        labels = labels, tck = 0.0)
} 

version <- ""
if (file.exists(file = "data/version.txt")) {
    version <- readLines("data/version.txt") # __cplusplus
    switch(version, 
        "199711"={version<-"até C++11"},
        "201103"={version<-"C++11"},
        "201402"={version<-"C++14"},
        "201703"={version<-"C++17"},
        "202002"={version<-"C++20"},
        "202302"={version<-"C++23"})
}