source("../common.R")

tests <- c("USE_GLM", "USE_DEFAULT")
colors <- grey.colors(2, start=0.25, end=0.9)
labels <- c("glm", "default")

total <- length(tests)
parts <- 0
spaces <- 0
axis_at <- c(1, 2)

caption <- paste0("Tempo de execução dos cálculos para geração da matriz projectionView usando compilador GCC e ", version)

list_item <- list()
for (test in tests) {
    test_data <- read.delim(paste("data/", test, ".dat", sep = ""))
    list_item <- append(list_item, list(remove_outliers(test_data$time)))
}

## without title and description
pdf(file = paste("generated/o__boxplot", ".pdf", sep = ""),
  width = 8,
  height = 5,
  family = "serif")

par(mar=c(3, 5, 1, 3))
create_boxplot("nanosegundos", list_item)

dev.off()

pdf(file = paste("generated/boxplot", ".pdf", sep = ""),
  width = 10,
  height = 6,
  family = "serif")
nf <- layout(matrix(c(
  1, 1, 1,
  2, 2, 2,
  2, 2, 2,
  2, 2, 2,
  2, 2, 2,
  3, 3, 3), nrow=6, byrow=TRUE))

par(mar=c(0, 3, 1, 3))
plot.new()

mtext(substitute(bold(caption), list(caption=caption)), side = 3, line = -3, cex = 0.75)

par(mar=c(3, 5, 0, 3))
create_boxplot("nanosegundos", list_item)

plot.new()
description <- paste(
  "Removido valores atípicos (outliers)",
  sep = "")
mtext(description, side = 1, line = 1, cex = 0.75, adj = 0)
mtext(readLines("data/max.txt"), side = 1, line = 1, cex = 0.75, adj = 1)

dev.off()

fileConn <- file("generated/caption.tex")
writeLines(paste0("\\caption{", caption, "}"), fileConn)
close(fileConn)

fileConn <- file("generated/description.tex")
writeLines(paste0("\n{\\par\\small Nota: ", description, "}"), fileConn)
close(fileConn)